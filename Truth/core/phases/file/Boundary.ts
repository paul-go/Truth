
namespace Truth
{
	/**
	 * A marking object that stakes out a starting and ending
	 * character offset within a statement, signifying the
	 * boundary of a particular subject.
	 */
	export class Boundary<TSubject extends Subject>
	{
		constructor(
			readonly offsetStart: number,
			readonly offsetEnd: number,
			readonly subject: TSubject)
		{ }
	}
	
	/**
	 * Groups together a series of related Boundary objects.
	 */
	export class BoundaryGroup<TSubject extends Subject>
	{
		/** */
		constructor(boundaries: Boundary<TSubject>[])
		{
			this.entries = Object.freeze(boundaries.slice().sort((entryA, entryB) =>
			{
				return entryA.offsetStart - entryB.offsetStart;
			}));
		}
		
		/** */
		*[Symbol.iterator]()
		{
			for (const entry of this.entries)
				yield entry;
		}
		
		/** */
		*eachSubject()
		{
			for (const entry of this.entries)
				yield entry.subject;
		}
		
		/** */
		inspect(offset: number): TSubject | null
		{
			for (const entry of this.entries)
				if (offset >= entry.offsetStart && offset <= entry.offsetEnd)
					return entry.subject;
			
			return null;
		}
		
		/** */
		first()
		{
			for (const entry of this)
				return entry;
			
			return null;
		}
		
		/** Gets the number of entries defined in the bounds. */
		get length()
		{
			return this.entries.length;
		}
		
		/** */
		private readonly entries: readonly Boundary<TSubject>[];
	}
}
