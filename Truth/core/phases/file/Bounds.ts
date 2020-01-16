
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
		
		/**
		 * Iterates through each subject in the boundary group.
		 */
		*eachSubject()
		{
			for (const entry of this.entries)
				yield entry.subject;
		}
		
		/**
		 * Returns the subject at the specified offset, or null in the case
		 * when no subject exists at the specified offset.
		 */
		inspect(offset: number): TSubject | null
		{
			for (const entry of this.entries)
				if (offset >= entry.offsetStart && offset <= entry.offsetEnd)
					return entry.subject;
			
			return null;
		}
		
		/**
		 * Returns the first subject in the boundary group, or null in the
		 * case when the boundary group contains no subjects.
		 */
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
