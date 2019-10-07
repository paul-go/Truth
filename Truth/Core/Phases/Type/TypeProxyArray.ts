
namespace Truth
{
	/**
	 * @internal
	 */
	export class TypeProxyArray
	{
		/**
		 * 
		 */
		constructor(private readonly array: ReadonlyArray<TypeProxy>) { }
		
		/**
		 * 
		 */
		maybeCompile()
		{
			if (this.compiledArray !== undefined)
				return this.compiledArray;
			
			const out = this.array
				.map(lazy => lazy.maybeCompile())
				.filter((type): type is Type => type !== null);
			
			return this.compiledArray = Object.freeze(out);
		}
		
		private compiledArray: ReadonlyArray<Type> | undefined = undefined;
	}
}
