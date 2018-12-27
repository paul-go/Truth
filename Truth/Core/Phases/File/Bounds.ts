
/**
 * Stakes out starting and ending character positions
 * of subjects within a given region.
 */
export class Bounds<TSubject>
{
	/** */
	constructor(entries: BoundsEntry<TSubject>[])
	{
		this.entries = Object.freeze(entries.slice().sort((entryA, entryB) =>
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
	private readonly entries: ReadonlyArray<BoundsEntry<TSubject>>;
}


/** */
export class BoundsEntry<TSubject>
{
	constructor(
		readonly offsetStart: number,
		readonly offsetEnd: number,
		readonly subject: TSubject)
	{ }
}
