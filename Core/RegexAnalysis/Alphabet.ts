import * as X from "../X";


/**
 * @internal
 */
export class Alphabet
{
	/** */
	constructor(...others: Alphabet[] | string[])
	{
		const allSymbols: string[] = [];
		
		for (const other of others)
		{
			if (other instanceof Alphabet)
			{
				for (const otherSymbol of other.symbols)
					allSymbols.push(otherSymbol);
			}
			else
			{
				allSymbols.push(other);
			}
		}
		
		allSymbols.sort((a, b) =>
		{
			if (b === Alphabet.wild)
				return 1;
			
			if (a === Alphabet.wild)
				return -1;
			
			return a > b ? -1 : 1;
		});
		
		this.symbols = new Set(allSymbols);
	}
	
	/** */
	*[Symbol.iterator]()
	{
		for (const symbol of this.symbols)
			yield symbol;
	}
	
	/** */
	clone()
	{
		return new Alphabet(this);
	}
	
	/** */
	has(symbol: string)
	{
		return this.symbols.has(symbol);
	}
	
	/** */
	hasWild()
	{
		return this.symbols.has(Alphabet.wild);
	}
	
	/** */
	private readonly symbols: ReadonlySet<string>;
	
	/** Stores the wildcard character. */
	static readonly wild = String.fromCharCode(0);
}
