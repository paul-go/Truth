import * as X from "../../X";


/**
 * 
 */
export class Statement
{
	/**
	 * @internal
	 * Logical clock value used to make chronological 
	 * creation-time comparisons between Statements.
	 */
	readonly stamp = X.VersionStamp.next();
	
	/** */
	constructor(document: X.Document, text: string)
	{
		this.document = document;
		this.indent = 0;
		this.declarationBounds = new Map();
		this.annotationBounds = new Map();
		this.textContent = text;
		this.jointPosition = -1;
		
		let cursor = -1;
		const flg = StatementFlags;
		
		// Compute the indent, while ignoring any carriage return characters
		while (++cursor < text.length)
		{
			const char = text[cursor];
			
			if (char === X.Syntax.tab || char === X.Syntax.space)
				this.indent++;
			
			else if (char !== "\r")
				break;
		}
		
		// Mark as a whitespace line, and return
		if (cursor >= text.length)
		{
			this.flags = this.flags | flg.isWhitespace;
			return;
		}
		
		// Check for a comment
		const cmt = X.Syntax.comment;
		if (cursor < text.length - cmt.length)
		{
			if (text.substr(cursor, cmt.length) === cmt)
			{
				this.flags = this.flags | flg.isComment;
				return;
			}
		}
		
		// Check for lines that have only the comment token,
		// followed immediately by the line terminator
		if (text.trim() === cmt.trimRight())
		{
			this.flags = this.flags | flg.isComment;
			return;
		}
		
		let identifierMarker = cursor;
		let jointPosition = -1;
		
		//
		const readIdentifiers = (includeAnonymous: boolean) =>
		{
			const identifiers = new Map<number, X.Identifier | null>();
			const identifierChars: string[] = [];
			
			while (cursor < text.length)
			{
				const char = text[cursor];
				const next = text.slice(cursor + 1, cursor + 2);
				const escaped = cursor > 0 && text[cursor - 1] === X.Syntax.escapeChar;
				const atCombinator = char === X.Syntax.combinator;
				const atEscape = char === X.Syntax.escapeChar;
				const atEnd = ++cursor >= text.length;
				const atJoint = (char === X.Syntax.joint)
					&& (jointPosition < 0)
					&& (next === X.Syntax.tab || next === X.Syntax.space || next === "");
				
				if (!atCombinator || escaped)
					if (!atJoint || escaped)
						if (!atEscape)
							identifierChars.push(char);
				
				if (atEnd || ((atCombinator || atJoint) && !escaped))
				{
					const identifierText = identifierChars.join("").trim();
					const identifier = identifierText ?
						new X.Identifier(identifierText) :
						null;
					
					if (identifier !== null || includeAnonymous)
						identifiers.set(identifierMarker, identifier);
					
					identifierChars.length = 0;
					identifierMarker = cursor;
				}
				
				if (atJoint)
				{
					jointPosition = cursor;
					return identifiers;
				}
			}
			
			return identifiers;
		}
		
		// If the following test passes, there's a 99% chance
		// we're parsing a pattern literal, so pass the input
		// string off to the pattern literal parser. If we get
		// back a PatternLiteral, we can skip reading in
		// hasaSubjects.
		if (text[cursor] === X.Syntax.patternDelimiter && cursor < text.length)
		{
			const readResult = tryReadPattern(text, cursor);
			if (readResult)
			{
				cursor = readResult.patternEnd;
				
				// Somewhat awkward, but we're depending on
				// the "".annotations" property to be accessible
				// after the annotationBound have been set.
				this.annotationBounds = readIdentifiers(false);
				const forePattern = new X.ForePattern(
					readResult.content,
					readResult.flags,
					this.annotations);
				
				// In the case when the statement contains a pattern,
				// the declarations contains a single subject, whose
				// content is an internal representation of the pattern
				// content (at the time of this writing, it has an CRC
				// at the end, that is generated from the annotations).
				const mapOneSubject = new Map<number, X.ForePattern>();
				mapOneSubject.set(readResult.patternStart, forePattern);
				this.declarationBounds = mapOneSubject;
				return;
			}
		}
		
		this.declarationBounds = readIdentifiers(true);
		this.annotationBounds = readIdentifiers(false);
		this.jointPosition = jointPosition;
		
		if (this.annotationBounds.size === 0)
			if (this.declarationBounds.size > 0)
				if (jointPosition > -1)
					this.flags = this.flags | StatementFlags.isRefresh;
	}
	
	/** */
	get isRefresh()
	{
		const f = StatementFlags.isRefresh;
		return (this.flags & f) === f;
	}
	
	/** Gets whether the statement is a comment. */
	get isComment()
	{
		const f = StatementFlags.isComment;
		return (this.flags & f) === f;
	}
	
	/** Gets whether the statement contains no non-whitespace characters. */
	get isWhitespace()
	{
		const f = StatementFlags.isWhitespace;
		return (this.flags & f) === f;
	}
	
	/** Gets whether the statement is a comment or whitespace. */
	get isNoop()
	{
		return this.isComment || this.isWhitespace;
	}
	
	/** Gets whether the statement has been removed from it's containing document. */
	get isDisposed()
	{
		const f = StatementFlags.isDisposed;
		return (this.flags & f) === f;
	}
	
	/** @internal */
	private flags = StatementFlags.none;
	
	/** Stores a reference to the document that contains this statement. */
	readonly document: X.Document;
	
	/** Stores the indent level of the statement. */
	readonly indent: number;
	
	/** */
	private readonly declarationBounds: SubjectBounds;
	
	/** */
	private readonly annotationBounds: SubjectBounds;
	
	/**
	 * Stores the position at which the joint operator exists
	 * in the statement. A negative number indicates that
	 * the joint operator does not exist in the statement.
	 */
	readonly jointPosition: number;
	
	/**
	 * Stores the unprocessed text content of the statement, 
	 * as it appears in the document. 
	 */
	readonly textContent: string;
	
	/**
	 * Gets a boolean value indicating whether or not the
	 * statement contains a declaration of a pattern.
	 */
	get hasPattern()
	{
		const d = this.declarations;
		return d.length === 1 && d[0].subject instanceof X.ForePattern;
	}
	
	/**
	 * @internal
	 * Marks the statement as being removed from it's containing document.
	 */
	dispose()
	{
		this.flags = this.flags & StatementFlags.isDisposed;
	}
	
	/**
	 * @returns The kind of StatementRegion that exists
	 * at the given character offset within the Statement.
	 */
	getRegion(offset: number)
	{
		if (this.isComment)
			return StatementRegion.void;
		
		if (this.isWhitespace)
			return StatementRegion.whitespace;
		
		if (offset < this.indent)
			return StatementRegion.void;
		
		if (this.hasPattern)
		{
			const decl = this.declarations[0];
			if (offset >= decl.offsetStart && offset <= decl.offsetEnd)
				return StatementRegion.pattern;
		}
		
		if (offset <= this.jointPosition)
		{
			for (const span of this.declarations)
				if (offset >= span.offsetStart && offset <= span.offsetEnd)
					return StatementRegion.declaration;
			
			return StatementRegion.declarationVoid;
		}
		else
		{
			for (const span of this.annotations)
				if (offset >= span.offsetStart && offset <= span.offsetEnd)
					return StatementRegion.annotation;
			
			return StatementRegion.annotationVoid;
		}
	}
	
	/**
	 * Gets the set of spans in that represent all declarations
	 * and annotations in this statement, from left to right.
	 */
	get subjects()
	{
		return this.declarations.concat(this.annotations);
	}
	
	/**
	 * Gets the set of spans in that represent the
	 * declarations of this statement, from left to right.
	 */
	get declarations()
	{
		if (this._declarations)
			return this._declarations;
		
		const out: X.Span[] = [];
		
		for (const [offset, subject] of this.declarationBounds)
			out.push(new X.Span(this, subject, offset));
		
		return this._declarations = out;
	}
	private _declarations: X.Span[] | null = null;
	
	/**
	 * Gets the set of spans in that represent the
	 * annotations of this statement, from left to right.
	 */
	get annotations()
	{
		if (this._annotations)
			return this._annotations;
		
		const out: X.Span[] = [];
		
		for (const [offset, subject] of this.annotationBounds)
			out.push(new X.Span(this, subject, offset));
		
		return this._annotations = out;
	}
	private _annotations: X.Span[] | null = null;
	
	/**
	 * 
	 */
	getSubject(offset: number)
	{
		return this.getDeclaration(offset) || this.getAnnotation(offset);
	}
	
	/**
	 * @returns A span to the declaration subject at the 
	 * specified offset, or null if there is none was found.
	 */
	getDeclaration(offset: number)
	{
		for (const span of this.declarations)
			if (offset >= span.offsetStart && offset <= span.offsetEnd)
				return span;
		
		return null;
	}
	
	/**
	 * @returns A span to the annotation subject at the 
	 * specified offset, or null if there is none was found.
	 */
	getAnnotation(offset: number)
	{
		for (const span of this.annotations)
			if (offset >= span.offsetStart && offset <= span.offsetEnd)
				return span;
		
		return null;
	}
	
	/**
	 * @returns The raw trimmed text of the complete
	 * annotation side of this statement.
	 */
	getAnnotationContent()
	{
		const jntLen = X.Syntax.joint.length;
		return this.textContent.slice(this.jointPosition + jntLen).trim();
	}
	
	/**
	 * @returns A string containing the inner comment text of
	 * this statement, excluding the comment syntax token.
	 * If the statement isn't a comment, null is returned.
	 */
	getCommentText()
	{
		return this.isComment ?
			this.textContent.slice(this.indent + X.Syntax.comment.length) :
			null;
	}
	
	/**
	 * Converts the statement to a formatted string representation.
	 */
	toString(includeIndent = false)
	{
		const indent = includeIndent ? X.Syntax.tab.repeat(this.indent) : "";
		
		// Contains the list of declarations in the statement, excluding
		// any declaration placeholders used to support anonymous
		// types.
		const decls = <X.Identifier[]>this.declarations
			.map(decl => decl.subject)
			.filter(subject => typeof subject !== "string");
		
		const annos = this.annotations.map(anno => anno.subject);
		const spaceL = ((decls.length && annos.length) || this.isRefresh) ? " " : "";
		const joint = (annos.length || this.isRefresh) ? X.Syntax.joint : "";
		const spaceR = joint !== "" && annos.length > 0 && !this.isRefresh ? " " : "";
		
		return indent + decls.join(", ") + spaceL + joint + spaceR + annos.join(", ");
	}
}


/** 
 * Stores a map of the character offsets within a Statement
 * that represent the starting positions of the statement's
 * Subjects.
 */
export type SubjectBounds = ReadonlyMap<number, X.Identifier | X.ForePattern | null>;


/**
 * Defines the areas of a statement that are significantly
 * different when performing inspection.
 */
export enum StatementRegion
{
	/**
	 * Refers to the area within a comment statement,
	 * or the whitespace preceeding a non-no-op.
	 */
	void,
	
	/**
	 * Refers to the area in the indentation area.
	 */
	whitespace,
	
	/**
	 * Refers to the 
	 */
	pattern,
	
	/** */
	declaration,
	
	/** */
	annotation,
	
	/** */
	declarationVoid,
	
	/** */
	annotationVoid
}


/** */
enum StatementFlags
{
	none = 0,
	isRefresh = 1,
	isComment = 2,
	isWhitespace = 4,
	isDisposed = 8,
}


/**
 * Attempts to read a pattern from the specified start position
 * in a text representation of a statement. If no pattern could
 * be found, null is returned.
 */
function tryReadPattern(statementText: string, startAt: number)
{
	const tokDtr = X.Syntax.patternDelimiter;
	if (statementText.substr(startAt, tokDtr.length) !== tokDtr)
		return null;
	
	let patternStart = startAt;
	let contentStart = startAt + tokDtr.length;
	let contentEnd = -1;
	let flags = X.PatternFlags.none;
	let cursor = startAt - 1;
	
	while (++cursor < statementText.length)
	{
		// Skip past escape sequences
		if (cursor > 0 && statementText[cursor- 1] === X.Syntax.escapeChar)
			continue;
		
		const char = statementText[cursor];
		
		// Quit if we find a joint while not in finalization
		if (char === X.Syntax.joint)
			break;
		
		// Enter into "possible finalization" mode
		// when a pattern delimiter is reached.
		if (char === X.Syntax.patternDelimiter)
		{
			const maybeContentEnd = cursor;
			
			if (cursor + 1 >= statementText.length || tryFinalize())
			{
				contentEnd = maybeContentEnd;
				break;
			}
			
			// False alarm. Rewind any pattern flags discovered.
			flags = X.PatternFlags.none;
		}
	}
	
	function tryFinalize()
	{
		while (++cursor < statementText.length)
		{
			const char = statementText[cursor];
			
			if (char === X.Syntax.space || char === X.Syntax.tab)
				continue;
			
			else if (char === X.Syntax.combinator)
				flags |= X.PatternFlags.coexistence;
			
			else if (char === X.Syntax.joint)
			{
				// Back up the cursor one space, 
				// so that pattern end calculations work.
				cursor--;
				return true;
			}
			
			return false;
		}
		
		return true;
	}
	
	if (contentEnd < 0)
		return null;
	
	return {
		patternStart,
		patternEnd: statementText.length - statementText.trimRight().length,
		content: statementText.slice(contentStart, contentEnd),
		flags
	}
}
