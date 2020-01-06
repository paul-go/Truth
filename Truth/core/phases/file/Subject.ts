
namespace Truth
{
	/** */
	export type Subject = DeclarationSubject | AnnotationSubject;
	
	/**
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * declarartions.
	 */
	export type DeclarationSubject = Identifier | Pattern | Uri | Anon;
	
	/**
	 * Stores a map of the character offsets within a Statement
	 * that represent the starting positions of the statement's
	 * annotations.
	 */
	export type AnnotationSubject = Identifier;
	
	/** */
	export class SubjectSerializer
	{
		/**
		 * Universal method for serializing a subject to a string,
		 * useful for debugging and supporting tests.
		 */
		static forExternal(
			target: SubjectContainer,
			escapeStyle: IdentifierEscapeKind = IdentifierEscapeKind.none)
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
			return this.serialize(subject, IdentifierEscapeKind.none, true);
		}
		
		/** */
		private static resolveSubject(target: SubjectContainer): Subject
		{
			return target instanceof Boundary ? target.subject :
				target instanceof Span ? target.boundary.subject :
				target instanceof InfixSpan ? target.boundary.subject :
				target;
		}
		
		/** */
		private static serialize(
			subject: SubjectContainer,
			escapeStyle: IdentifierEscapeKind,
			includeHash: boolean)
		{
			if (subject instanceof Identifier)
				return subject.toString(escapeStyle);
			
			else if (subject instanceof Pattern)
				return subject.toString(includeHash);
			
			else if (subject instanceof Uri)
				return subject.toString();
			
			else if (subject instanceof Anon)
				return subject.toString();
			
			throw Exception.unknownState();
		}
	}
	
	/** Identifies a Type that is or contains a Subject. */
	export type SubjectContainer = Subject | Boundary<Subject> | Span | InfixSpan;
}
