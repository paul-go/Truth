
namespace Truth
{
	/**
	 * A type alias that refers to the kinds of objects that exist 
	 * at the bottom of a Statement's abstract syntax tree.
	 */
	export type Subject = Term | Pattern | KnownUri;
	
	/** Aliases a type that is or contains a Subject. */
	export type SubjectContainer = Span | InfixSpan | Boundary<Subject> | Subject;
	
	/** */
	export class SubjectSerializer
	{
		/**
		 * Universal method for serializing a subject to a string,
		 * useful for debugging and supporting tests.
		 */
		static forExternal(
			target: SubjectContainer,
			escapeStyle: TermEscapeKind = TermEscapeKind.none)
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
			return this.serialize(subject, TermEscapeKind.none, true);
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
			escapeStyle: TermEscapeKind,
			includeHash: boolean)
		{
			if (subject instanceof Term)
				return subject.toString(escapeStyle);
			
			else if (subject instanceof Pattern)
				return subject.toString(includeHash);
			
			else if (subject instanceof KnownUri)
				return subject.toString();
			
			throw Exception.unknownState();
		}
	}
}
