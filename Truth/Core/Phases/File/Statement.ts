import * as X from "./X";


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
		
		let subjectMarker = cursor;
		let jointPosition = -1;
		
		//
		const readSubjects = (includeAnonymous: boolean) =>
		{
			const subjects = new Map<number, X.Subject | null>();
			const subjectChars: string[] = [];
			
			while (cursor < text.length)
			{
				const char = text[cursor];
				const escaped = cursor > 0 && text[cursor - 1] === X.Syntax.escapeChar;
				const atCombinator = char === X.Syntax.combinator;
				const atJoint = char === X.Syntax.joint && jointPosition < 0;
				const atEscape = char === X.Syntax.escapeChar;
				const atEnd = ++cursor >= text.length;
				
				if (!atCombinator || escaped)
					if (!atJoint || escaped)
						if (!atEscape)
							subjectChars.push(char);
				
				if (atEnd || ((atCombinator || atJoint) && !escaped))
				{
					const subjectContent = subjectChars.join("").trim();
					const subject = subjectContent ?
						new X.Subject(subjectContent) :
						null;
					
					if (subject !== null || includeAnonymous)
						subjects.set(subjectMarker, subject);
					
					subjectChars.length = 0;
					subjectMarker = cursor;
				}
				
				if (atJoint)
				{
					jointPosition = cursor;
					return subjects;
				}
			}
			
			return subjects;
		}
		
		// If the following test passes, there's a 99% chance
		// we're parsing a pattern literal, so pass the input
		// string off to the pattern literal parser. If we get
		// back a PatternLiteral, we can skip reading in
		// hasaSubjects.
		if (text[cursor] === X.Syntax.patternDelimiter && cursor < text.length)
		{
			const readResult = X.PatternTextTools.read(text, cursor);
			if (readResult)
			{
				cursor = readResult.patternEnd;
				this.annotationBounds = readSubjects(false);
				
				const annotationSubjects = 
					<X.Subject[]>Array.from(this.annotationBounds.values())
						.filter(subject => subject);
				
				const serialized = X.PatternTextTools.serialize(
					readResult.content,
					readResult.flags,
					annotationSubjects);
				
				// In the case when the statement contains a pattern,
				// the declarations contains a single subject, whose
				// content is an internal representation of the pattern
				// content (at the time of this writing, it has an CRC
				// at the end, that is generated from the annotations).
				const mapOneSubject = new Map<number, X.Subject>();
				mapOneSubject.set(
					readResult.patternStart, 
					new X.Subject(serialized));
				
				this.declarationBounds = mapOneSubject;
				return;
			}
		}
		
		this.declarationBounds = readSubjects(true);
		this.annotationBounds = readSubjects(false);
		this.jointPosition = jointPosition;
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
	get isPattern()
	{
		const d = this.declarations;
		return (
			d.length === 1 && 
			d[0].subject instanceof X.Subject &&
			d[0].subject.pattern !== null);
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
		
		if (this.isPattern)
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
		const decls = <X.Subject[]>this.declarations
			.map(decl => decl.subject)
			.filter(subject => subject instanceof X.Subject);
		
		const annos = this.annotations.map(anno => anno.subject);
		const joint =
			(decls.length && annos.length ? " " : "") +
			(annos.length ? X.Syntax.joint + " " : "");
		
		return indent + decls.join(", ") + joint + annos.join(", ");
	}
}


/** 
 * Stores a map of the character offsets within a Statement
 * that represent the starting positions of the statement's
 * Subjects.
 */
export type SubjectBounds = ReadonlyMap<number, X.Subject | null>;


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
	isComment = 1,
	isWhitespace = 2,
	isDisposed = 4
}
