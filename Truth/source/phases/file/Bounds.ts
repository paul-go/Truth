
namespace Truth
{
	/**
	 * Stakes out starting and ending character positions
	 * of subjects within a given region.
	 */
	export class BoundaryGroup<TSubject>
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
		private readonly entries: ReadonlyArray<Boundary<TSubject>>;
	}


	/** */
	export class Boundary<TSubject>
	{
		constructor(
			readonly offsetStart: number,
			readonly offsetEnd: number,
			readonly subject: TSubject)
		{ }
	}
}
