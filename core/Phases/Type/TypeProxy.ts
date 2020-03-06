
namespace Truth
{
	/**
	 * @internal
	 */
	export class TypeProxy
	{
		/** */
		constructor(private readonly phrase: Phrase)
		{ }
		
		/** */
		maybeCompile()
		{
			if (this.compiledType !== undefined)
				return this.compiledType;
			
			return this.compiledType = Type.construct(this.phrase);
		}
		
		/** */
		private compiledType: Type | null | undefined = undefined;
	}
}
