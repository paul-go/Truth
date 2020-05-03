
namespace Truth
{
	/**
	 * Defines a type that is or contains a Subject.
	 */
	export type SubjectContainer = Span | InfixSpan | Boundary<Subject> | Subject;
	
	/**
	 * Defines a type that refers to the kinds of objects that exist 
	 * at the bottom of a Statement's abstract syntax tree.
	 */
	export type Subject = Term | Pattern | KnownUri;
	
	/**
	 * Utility methods that apply to all Subject instances.
	 */
	export namespace Subject
	{
		/**
		 * Universal method for serializing a subject to a string,
		 * useful for debugging and supporting tests.
		 */
		export function serializeExternal(
			target: SubjectContainer,
			escapeStyle: TermEscapeKind = TermEscapeKind.none)
		{
			const subject = resolveSubject(target);
			return serialize(subject, escapeStyle, false);
		}
		
		/**
		 * Serializes a subject, or a known subject containing object for internal use.
		 */
		export function serializeInternal(target: SubjectContainer)
		{
			const subject = resolveSubject(target);
			return serialize(subject, TermEscapeKind.none, true);
		}
		
		/** */
		function resolveSubject(target: SubjectContainer): Subject
		{
			return target instanceof Boundary ? target.subject :
				target instanceof Span ? target.boundary.subject :
				target instanceof InfixSpan ? target.boundary.subject :
				target;
		}
		
		/** */
		function serialize(
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
