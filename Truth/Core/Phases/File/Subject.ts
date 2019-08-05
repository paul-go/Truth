import * as X from "../../X";


/** */
export type Subject = DeclarationSubject | AnnotationSubject;

/**
 * Stores a map of the character offsets within a Statement
 * that represent the starting positions of the statement's
 * declarartions.
 */
export type DeclarationSubject = X.Identifier | X.Pattern | X.Uri | X.Anon;

/**
 * Stores a map of the character offsets within a Statement
 * that represent the starting positions of the statement's
 * annotations.
 */
export type AnnotationSubject = X.Identifier;


/** */
export class SubjectSerializer
{
	/**
	 * Universal method for serializing a subject to a string,
	 * useful for debugging and supporting tests.
	 */
	static forExternal(
		target: SubjectContainer,
		escapeStyle: X.IdentifierEscapeKind = X.IdentifierEscapeKind.none)
	{
		const subject = this.resolveSubject(target);
		return this.serialize(subject, escapeStyle, false);
	}
	
	/**
	 * Serializes a subject, or a known subject containing object for internal use.
	 */
	static forInternal(target: SubjectContainer)
	{
		const subject = this.resolveSubject(target);
		return this.serialize(subject, X.IdentifierEscapeKind.none, true);
	}
	
	/** */
	private static resolveSubject(target: SubjectContainer): X.Subject
	{
		return target instanceof X.Boundary ? target.subject :
			target instanceof X.Span ? target.boundary.subject :
			target instanceof X.InfixSpan ? target.boundary.subject :
			target;
	}
	
	/** */
	private static serialize(
		subject: SubjectContainer,
		escapeStyle: X.IdentifierEscapeKind,
		includeHash: boolean)
	{
		if (subject instanceof X.Identifier)
			return subject.toString(escapeStyle);
		
		else if (subject instanceof X.Pattern)
			return subject.toString(includeHash);
		
		else if (subject instanceof X.Uri)
			return subject.toString();
		
		else if (subject instanceof X.Anon)
			return subject.toString();
		
		throw X.Exception.unknownState();
	}
}

/** Identifies a Type that is or contains a Subject. */
export type SubjectContainer = Subject | X.Boundary<X.Subject> | X.Span | X.InfixSpan;
