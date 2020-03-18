
namespace Truth
{
	/**
	 * The base class of all domain objects in the system.
	 * (The system is slowing being migrated so that more
	 * classes make use of this feature).
	 */
	export abstract class AbstractClass
	{
		/** @internal */
		readonly id = getNextClassId();
		
		/** @internal */
		abstract readonly class: Class;
	}
	
	let nextClassId = 0;
	
	/** */
	function getNextClassId()
	{
		return (++nextClassId) % 2 ** 32;
	}
	
	/**
	 * A union type between all domain objects in the system.
	 */
	export type AnyClass = 
		Document | 
		Statement | 
		Reference |
		Span | 
		Phrase |
		Term | 
		KnownUri | 
		Pattern |
		Fork;
	
	/**
	 * A const enum to uniquely identify each domain object in the system.
	 */
	export const enum Class
	{
		document,
		statement,
		reference,
		span,
		phrase,
		term,
		knownUri,
		pattern,
		fork
	}
}
