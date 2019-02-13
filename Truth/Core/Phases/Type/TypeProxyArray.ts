import * as X from "../../X";


/**
 * @internal
 */
export class TypeProxyArray
{
	/**
	 * 
	 */
	constructor(private readonly array: ReadonlyArray<X.TypeProxy>) { }
	
	/**
	 * 
	 */
	maybeCompile()
	{
		if (this.compiledArray !== undefined)
			return this.compiledArray;
		
		const out = this.array
			.map(lazy => lazy.maybeCompile())
			.filter((type): type is X.Type => type !== null);
		
		return this.compiledArray = Object.freeze(out);
	}
	
	private compiledArray: ReadonlyArray<X.Type> | undefined = undefined;
}
