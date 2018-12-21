import * as X from "../X";


/**
 * 
 */
export class AlphabetRange
{
	constructor(
		readonly from: number,
		readonly to: number)
	{ }
}


/**
 * @internal
 */
export class Alphabet
{
	/** */
	constructor(...ranges: AlphabetRange[])
	{
		this.ranges = ranges;
	}
	
	/**
	 * Iterates through each character defined in the alphabet.
	 */
	*[Symbol.iterator]()
	{
		for (const range of this.ranges)
			for (let i = range.from; i < range.to; i++)
				yield String.fromCharCode(i);
	}
	
	/**
	 * Iterates through all defined ranges in the alphabet,
	 * excluding the wildcard range.
	 */
	*eachRange()
	{
		if (this.hasWildcard)
		{
			for (let rangeIdx = 0; rangeIdx < this.ranges.length - 1;)
				yield this.ranges[rangeIdx++];
		}
		else for (const range of this.ranges)
			yield range;
	}
	
	/** */
	has(symbol: string | number)
	{
		if (symbol === Alphabet.wildcard)
			return this.hasWildcard();
		
		const code = toCharCode(symbol);
		
		for (const range of this.ranges)
			if (range.from >= code && range.to <= code)
				return true;
		
		return false;
	}
	
	/** */
	hasWildcard()
	{
		const rng = this.ranges;
		return rng.length > 0 && rng[rng.length - 1] === Alphabet.wildcardRange;
	}
	
	/**
	 * @returns A string representation of this object, 
	 * for testing and debugging purposes.
	 */
	toString()
	{
		const symbols: string[] = [];
		
		for (const range of this.ranges)
			symbols.push(range.from === range.to ?
				String.fromCharCode(range.from) :
				String.fromCharCode(range.from) + " - " + String.fromCharCode(range.to));
		
		if (this.hasWildcard())
			symbols.push("(wild)");
		
		return "[" + symbols.join(", ") + "]";
	}
	
	/** */
	private readonly ranges: ReadonlyArray<AlphabetRange> = [];
	
	/**
	 * 
	 */
	static readonly wildcard = String.fromCharCode(0);
	
	/**
	 * Stores a range that represents the wildcard character.
	 * The range of the wildcard is positive infinity in both directions,
	 * to ensure that it's always sorted last in the ranges array.
	 */
	static readonly wildcardRange = new AlphabetRange(Infinity, Infinity);
}


/**
 * A disposable class for easily creating Alphabet instances
 * (This design avoids introducing mutability into the Alphabet class).
 */
export class AlphabetBuilder
{
	/** */
	constructor(...others: (X.Alphabet | X.AlphabetRange | string | number)[])
	{
		for (const item of others)
		{
			if (item instanceof X.Alphabet)
			{
				for (const range of item.eachRange())
					this.ranges.push(range);
			}
			else if (item instanceof X.AlphabetRange)
			{
				this.ranges.push(item);
			}
			else
			{
				const code = toCharCode(item);
				this.ranges.push(new X.AlphabetRange(code, code));
			}
		}
	}
	
	/**
	 * Adds an entry to the alphabet.
	 * If the second parameter is omitted, the entry refers to a
	 * single character, rather than a range of characters.
	 */
	add(from: string | number, to?: string | number)
	{
		const toAsNum = to === undefined ? from : to;
		
		this.ranges.push(new X.AlphabetRange(
			toCharCode(from),
			toCharCode(toAsNum)));
		
		return this;
	}
	
	/**
	 * @returns An optimized Alphabet instances composed 
	 * from the characters and ranges applied to this AlphabetBuilder.
	 */
	toAlphabet()
	{
		this.ranges.sort((a, b) => a.from - b.from);
		
		// Quick optimization of ranges
		for (let i = 0; i < this.ranges.length - 1;)
		{
			const range = this.ranges[i];
			const nextRange = this.ranges[i + 1];
			
			// Omit
			if (range.to > nextRange.to)
			{
				this.ranges.splice(i + 1, 1);
			}
			// Concat
			else if (range.to >= nextRange.from)
			{
				this.ranges[i] = new X.AlphabetRange(range.from, nextRange.to);
				this.ranges.splice(i + 1, 1);
			}
		}
		
		return new X.Alphabet(...this.ranges);
	}
	
	/** */
	private readonly ranges: X.AlphabetRange[] = [];
}


/** */
function toCharCode(symbol: string | number)
{
	return typeof symbol === "string" ?
		symbol.charCodeAt(0) :
		symbol;
}
