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
			for (let i = range.from; i <= range.to; i++)
				yield String.fromCodePoint(i);
	}
	
	/**
	 * Iterates through all defined ranges in the alphabet,
	 * excluding the wildcard range.
	 */
	*eachRange()
	{
		if (this.hasWildcard())
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
				String.fromCodePoint(range.from) :
				String.fromCodePoint(range.from) + " - " + String.fromCodePoint(range.to));
		
		if (this.hasWildcard())
			symbols.push(Alphabet.wildcard);
		
		return "[" + symbols.join(", ") + "]";
	}
	
	/** */
	private readonly ranges: ReadonlyArray<AlphabetRange> = [];
	
	/**
	 * Stores a special token that the system understands to be the
	 * wildcard character. The length of the token is longer than any
	 * other token that could otherwise be found in the alphabet.
	 */
	static readonly wildcard = "((wild))";
	
	/**
	 * Stores a range that represents the wildcard character.
	 * The range of the wildcard is positive infinity in both directions,
	 * to ensure that it's always sorted last in the ranges array.
	 */
	static readonly wildcardRange = Object.freeze(new AlphabetRange(Infinity, Infinity));
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
				const theRanges = Array.from(item.eachRange());
				
				for (const range of theRanges)
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
	
	/** */
	addWild()
	{
		this.ranges.push(Alphabet.wildcardRange);
	}
	
	/**
	 * @returns An optimized Alphabet instances composed 
	 * from the characters and ranges applied to this AlphabetBuilder.
	 * 
	 * @param invert In true, causes the entries in the generated
	 * Alphabet to be reversed, such that every character marked
	 * as included is excluded, and vice versa.
	 */
	toAlphabet(invert?: boolean)
	{
		if (this.ranges.length === 0)
			return new Alphabet();
		
		const ranges = this.ranges
			.slice()
			.sort((a, b) => a.from - b.from);
		
		// Quick optimization of ranges
		for (let i = 0; i < ranges.length - 1; i++)
		{
			const thisRange = ranges[i];
			
			while (i < ranges.length - 1 )
			{
				const nextRange = ranges[i + 1];
				
				// Omit
				if (thisRange.to >= nextRange.to)
				{
					ranges.splice(i + 1, 1);
				}
				// Concat
				else if (thisRange.to + 1 >= nextRange.from)
				{
					ranges.splice(i + 1, 1);
					ranges[i] = new X.AlphabetRange(thisRange.from, nextRange.to);
				}
				// Next
				else break;
			}
		}
		
		if (invert)
		{
			//
			// This alphabet inversion algorithm has to deal with 4 cases,
			// depending on the pattern of the ranges and the spaces.
			// After the ranges are sorted and optimized, the ranges
			// array represents a layout that alternates between ranges
			// and spaces. There are 4 basic layouts (R = Range, S = Space):
			//
			// RSRS - Starts with a range, ends with a space
			// SRSR - Starts with a space, ends with a range
			// RSRSR - Starts with a range, ends with a range
			// SRSRS - Starts with a space, ends with a space
			// 
			// The algorithm deal with any leading or trailing space
			// separately, to make the looping less complicated. 
			// 
			
			const rangesInv: X.AlphabetRange[] = [];
			const lastRange = ranges[ranges.length - 1];
			const matchesZero = ranges[0].from === 0;
			const matchesMax = lastRange.to === X.UnicodeMax;
			
			if (matchesZero && matchesMax && ranges.length === 1)
				return new Alphabet();
			
			if (!matchesZero)
				rangesInv.push(new X.AlphabetRange(0, ranges[0].from));
			
			const endAt = matchesMax ?
				lastRange.from :
				X.UnicodeMax;
			
			for (let i = 0; i < ranges.length; i++)
			{
				const prevRangeEnd = ranges[i].to;
				const nextRangeStart = i < ranges.length - 1 ? 
					ranges[i + 1].from :
					X.UnicodeMax + 1;
				
				rangesInv.push(new AlphabetRange(
					prevRangeEnd + 1,
					nextRangeStart - 1));
				
				if (nextRangeStart >= endAt)
					break;
			}
			
			if (!matchesMax)
				rangesInv.push(new X.AlphabetRange(lastRange.from, X.UnicodeMax));
		}
		
		return new X.Alphabet(...ranges);
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
