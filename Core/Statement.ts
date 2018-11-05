import * as X from "./X";


let nextID = 0;


/**
 * 
 */
export class Statement
{
	/** @internal */
	private id = ++nextID;
	
	/** */
	constructor(document: X.Document, text: string)
	{
		this.document = document;
		this.indent = 0;
		this.hasaSubjects = new Map();
		this.isaSubjects = new Map();
		this.textContent = text;
		this.jointPosition = -1;
		
		let cursor = -1;
		const flg = StatementFlags;
		const char = () => text[cursor];
		
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
		
		const readSubjects = (includeAnonymous: boolean) =>
		{
			const subjects = new Map<number, X.Subject | null>();
			const subjectChars: string[] = [];
			
			while (cursor < text.length)
			{
				const char = text[cursor];
				const escaped = cursor > 0 && text[cursor - 1] === X.Syntax.escapeChar;
				const atCombinator = char === X.Syntax.combinator;
				const atJoint = char === X.Syntax.joint;
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
		
		this.hasaSubjects = readSubjects(true);
		this.isaSubjects = readSubjects(false);
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
	readonly hasaSubjects: SubjectBoundaries;
	
	/** */
	readonly isaSubjects: SubjectBoundaries;
	
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
	 * @internal
	 * Marks the statement as being removed from it's containing document.
	 */
	dispose()
	{
		this.flags = this.flags & StatementFlags.isDisposed;
	}
	
	/**
	 * Returns contextual statement information relevant at 
	 * the specified character offset. If a pointer exists at the
	 * specified, offset, it is included in the returned object.
	 */
	inspect(offset: number)
	{
		let region = StatementRegion.none;
		let pointer: X.Pointer | null = null;
		
		if (!this.isNoop)
		{
			if (offset === 0)
			{
				region = region | StatementRegion.preStatement;
				
				if (this.indent === 0)
					region = region | StatementRegion.preIndent;
			}
			else if (offset < this.indent)
			{
				region = region | StatementRegion.midIndent;
			}
			else 
			{
				if (offset === this.indent)
					region = region | StatementRegion.postIndent;
				
				if (offset === this.textContent.length)
					region = region | StatementRegion.postStatement;
				
				if (offset === this.jointPosition)
					region = region | StatementRegion.preJoint;
				
				const pointers = [
					...Array.from(this.declarations),
					null,
					...Array.from(this.annotations)
				];
				
				let side = this.hasaSubjects;
				
				// Handle the case when the statement is anonymous and untyped (":")
				// If there is only one pointer, it has to be the 
				if (pointers.length === 1)
				{
					if (offset > this.jointPosition)
						region = region | StatementRegion.postJoint;
				}
				else for (let idx = -1; ++idx < pointers.length;)
				{
					const prevPointer = pointers.length > 1 ? pointers[idx - 1] : undefined;
					const thisPointer = pointers[idx];
					
					// If we're at the joint
					if (thisPointer === null)
					{
						side = this.isaSubjects;
					}
					// If the offset is immediately before, immediately after, or on the subject.
					else if (offset >= thisPointer.offsetStart && offset <= thisPointer.offsetEnd)
					{
						region = side === this.hasaSubjects ? 
							region | StatementRegion.hasaWord :
							region | StatementRegion.isaWord;
						
						pointer = thisPointer;
						break;
					}
					// If we're just before the joint, but past all the has-a words.
					else if (thisPointer === null && offset < this.jointPosition)
					{
						region = region | StatementRegion.preJoint;
						break;
					}
					// If we're just past the joint, but before the first is-a subject
					else if (prevPointer === null && offset < thisPointer.offsetStart)
					{
						region = region | StatementRegion.postJoint;
						break;
					}
					// If we're between words, on either the has-a or is-a side.
					else if (
						prevPointer && 
						thisPointer && 
						offset >= prevPointer.offsetEnd &&
						offset <= thisPointer.offsetStart)
					{
						region = side === this.hasaSubjects ?
							region | StatementRegion.postHasaWord :
							region | StatementRegion.postIsaWord;
						
						break;
					}
				}
			}
		}
		
		return {
			side: this.jointPosition < 0 || offset < this.jointPosition ? 
				this.hasaSubjects : 
				this.isaSubjects,
			region,
			pointer
		};
	}
	
	/**
	 * Gets the kind of StatementArea that exists at the 
	 * given character offset within the Statement.
	 */
	getAreaKind(offset: number)
	{
		if (this.isComment)
			return StatementAreaKind.void;
		
		if (this.isWhitespace)
			return StatementAreaKind.whitespace;
		
		if (offset < this.indent)
			return StatementAreaKind.void;
		
		if (offset <= this.jointPosition)
		{
			for (const pointer of this.declarations)
				if (offset >= pointer.offsetStart && offset <= pointer.offsetEnd)
					return StatementAreaKind.declaration;
			
			return StatementAreaKind.declarationVoid;
		}
		else
		{
			for (const pointer of this.annotations)
				if (offset >= pointer.offsetStart && offset <= pointer.offsetEnd)
					return StatementAreaKind.annotation;
			
			return StatementAreaKind.annotationVoid;
		}
		
		return StatementAreaKind.void;
	}
	
	/**
	 * @returns A pointer to the has-a subject at the specified offset,
	 * or null if there is no has-a subject at the specified offset.
	 */
	getDeclaration(offset: number)
	{
		for (const pointer of this.declarations)
			if (offset >= pointer.offsetStart && offset <= pointer.offsetEnd)
				return pointer;
		
		return null;
	}
	
	/**
	 * @returns A pointer to the is-a subject at the specified offset,
	 * or null if there is no is-a subject at the specified offset.
	 */
	getAnnotation(offset: number)
	{
		for (const pointer of this.annotations)
			if (offset >= pointer.offsetStart && offset <= pointer.offsetEnd)
				return pointer;
		
		return null;
	}
	
	/**
	 * Gets the set of pointers in that represent all declarations
	 * and annotations in this statement, from left to right.
	 */
	get subjects()
	{
		return this.declarations.concat(this.annotations);
	}
	
	/**
	 * Gets the set of pointers in that represent the
	 * declarations of this statement, from left to right.
	 */
	get declarations()
	{
		if (this._declarations)
			return this._declarations;
		
		const out: X.Pointer[] = [];
		
		for (const [offset, subject] of this.hasaSubjects)
			out.push(new X.Pointer(this, subject, true, false, offset));
		
		return this._declarations = out;
	}
	private _declarations: X.Pointer[] | null = null;
	
	/**
	 * Gets the set of pointers in that represent the
	 * annotations of this statement, from left to right.
	 */
	get annotations()
	{
		if (this._annotations)
			return this._annotations;
		
		const out: X.Pointer[] = [];
		
		for (const [offset, subject] of this.isaSubjects)
			out.push(new X.Pointer(this, subject, false, true, offset));
		
		return this._annotations = out;
	}
	private _annotations: X.Pointer[] | null = null;
	
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
export type SubjectBoundaries = ReadonlyMap<number, X.Subject | null>;


/**
 * Defines the areas of a statement that are significantly
 * different when performing inspection.
 */
export enum StatementAreaKind
{
	/** */
	void,
	
	/** */
	whitespace,
	
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








enum StatementRegion
{
	/**
	 * A region cannot be inferred from the statement, because it is a no-op.
	 */
	none = 0,
	
	/**
	 * The cursor is at left-most position on the line.
	 */
	preStatement = 1,
	
	/**
	 * The cursor is at the left-most position on the line, 
	 * and whitespace characters are on the right.
	 * 
	 * Example:
	 * |...
	 */
	preIndent = 2,
	
	/**
	 * The cursor has indent-related whitespace characters 
	 * on both it's left and right.
	 * 
	 * Example:
	 * ..|..subject : subject
	 */
	midIndent = 4,
	
	/**
	 * The cursor has zero or more whitespace characters on its left,
	 * and zero non-whitespace characters on its right.
	 * 
	 * Example:
	 * ...|
	 */
	postIndent = 8,
	
	/**
	 * The cursor is positioned direct before, directly after, or between
	 * the characters of a has-a subject.
	 * 
	 * Example:
	 * ...|subject : subject
	 */
	hasaWord = 16,
	
	/**
	 * The cursor has zero or more whitespace characters on it's left,
	 * preceeded by a comma, preceeded by a has-a subject, and either
	 * one or more whitespace characters to it's right, or the statement
	 * separator.
	 * 
	 * Example:
	 * subject| : subject
	 */
	postHasaWord = 32,
	
	/**
	 * The cursor has zero or more whitespace characters on it's left,
	 * which are preceeded by the statement separator.
	 * 
	 * Example:
	 * subject |: subject
	 */
	preJoint = 64,
	
	/**
	 * The cursor has zero or more whitespace characters on it's left,
	 * which are preceeded by the statement separator.
	 * 
	 * Example:
	 * subject :| subject
	 */
	postJoint = 128,
	
	/**
	 * The cursor is positioned direct before, directly after, 
	 * or bettween the characters of an is-a subject.
	 * 
	 * Example:
	 * subject : subject|, subject
	 */
	isaWord = 256,
	
	/**
	 * The cursor has zero or more whitespace characters on it's left,
	 * preceeded by a comma, preceeded by an is-a subject, and either
	 * one or more whitespace characters to it's right, or the statement
	 * terminator.
	 * 
	 * Example:
	 * subject : subject,| subject
	 */
	postIsaWord = 512,
	
	/**
	 * The cursor is at the very last position of the line.
	 * 
	 * Example:
	 * subject : subject|
	 */
	postStatement = 1024
}
