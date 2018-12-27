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
		const line = X.LineParser.parse(text);
		this.document = document;
		this.sourceText = line.sourceText;
		this.indent = line.indent;
		this.flags = line.flags;
		this.declarationBounds = line.declarations;
		this.annotationBounds = line.annotations;
		this.jointPosition = line.jointPosition;
	}
	
	/** */
	get isRefresh()
	{
		const f = X.LineFlags.isRefresh;
		return (this.flags & f) === f;
	}
	
	/** Gets whether the statement is a comment. */
	get isComment()
	{
		const f = X.LineFlags.isComment;
		return (this.flags & f) === f;
	}
	
	/** Gets whether the statement contains no non-whitespace characters. */
	get isWhitespace()
	{
		const f = X.LineFlags.isWhitespace;
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
		const f = X.LineFlags.isDisposed;
		return (this.flags & f) === f;
	}
	
	/** @internal */
	private flags = X.LineFlags.none;
	
	/** Stores a reference to the document that contains this statement. */
	readonly document: X.Document;
	
	/** Stores the indent level of the statement. */
	readonly indent: number;
	
	/** */
	private readonly declarationBounds: X.Bounds<X.DeclarationSubject>;
	
	/** */
	private readonly annotationBounds: X.Bounds<X.AnnotationSubject>;
	
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
	readonly sourceText: string;
	
	/**
	 * Gets a boolean value indicating whether or not the
	 * statement contains a declaration of a pattern.
	 */
	get hasPattern()
	{
		const d = this.declarations;
		return d.length === 1 && d[0].subject instanceof X.Pattern;
	}
	
	/**
	 * @internal
	 * Marks the statement as being removed from it's containing document.
	 */
	dispose()
	{
		this.flags = this.flags & X.LineFlags.isDisposed;
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
	get spans()
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
		
		for (const { offsetStart, offsetEnd, subject } of this.declarationBounds)
			out.push(new X.Span(this, offsetStart, offsetEnd, subject));
		
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
		
		for (const { offsetStart, offsetEnd, subject } of this.annotationBounds)
			out.push(new X.Span(this, offsetStart, offsetEnd, subject));
		
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
		return this.sourceText.slice(this.jointPosition + jntLen).trim();
	}
	
	/**
	 * @returns A string containing the inner comment text of
	 * this statement, excluding the comment syntax token.
	 * If the statement isn't a comment, null is returned.
	 */
	getCommentText()
	{
		return this.isComment ?
			this.sourceText.slice(this.indent + X.Syntax.comment.length) :
			null;
	}
	
	/**
	 * Converts the statement to a formatted string representation.
	 */
	toString(includeIndent = false)
	{
		const serializeSpans = (spans: X.Span[], escStyle: X.IdentifierEscapeKind) =>
		{
			return spans
				.filter(sp => typeof sp.subject !== "string")
				.map(sp => X.SubjectSerializer.invoke(sp.subject, escStyle))
				.join(X.Syntax.combinator + X.Syntax.space);
		}
		
		const indent = includeIndent ? X.Syntax.tab.repeat(this.indent) : "";
		const decls = serializeSpans(this.declarations, X.IdentifierEscapeKind.declaration);
		const annos = serializeSpans(this.annotations, X.IdentifierEscapeKind.annotation);
		const spaceL = ((decls.length && annos.length) || this.isRefresh) ? " " : "";
		const joint = (annos.length || this.isRefresh) ? X.Syntax.joint : "";
		const spaceR = joint !== "" && annos.length > 0 && !this.isRefresh ? " " : "";
		
		return indent + decls + spaceL + joint + spaceR + annos;
	}
}


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
