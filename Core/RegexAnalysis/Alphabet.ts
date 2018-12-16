import * as X from "../X";


/**
 * @internal
 */
export class Alphabet
{
	/** */
	constructor(...others: Alphabet[] | string[])
	{
		let hasWild = false;
		const allSymbols: string[] = [];
		
		const add = (symbol: string) =>
		{
			if (symbol === Alphabet.wildcard)
				hasWild = true;
			else
				allSymbols.push(symbol);
		}
		
		for (const other of others)
		{
			if (other instanceof Alphabet)
			{
				for (const otherSymbol of other.symbols)
					add(otherSymbol);
			}
			else add(other);
		}
		
		if (allSymbols.length === 0)
			throw X.ExceptionMessage.unknownState();
		
		allSymbols.sort();
		
		if (hasWild)
			allSymbols.push(Alphabet.wildcard);
		
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
	hasWildcard()
	{
		return this.symbols.has(Alphabet.wildcard);
	}
	
	/**
	 * @returns A string representation of this object, 
	 * for testing and debugging purposes.
	 */
	toString()
	{
		const wild = Alphabet.wildcard;
		const symbols = Array.from(this.symbols).filter(s => s !== wild);
		
		if (this.hasWildcard())
			symbols.push("(wild)");
		
		return "[" + symbols.join(", ") + "]";
	}
	
	/** */
	private readonly symbols: ReadonlySet<string>;
	
	/** Stores the wildcard character. */
	static readonly wildcard = String.fromCharCode(0);
}
