
namespace Truth
{
	/**
	 * @internal
	 */
	export class TypeProxy
	{
		/** */
		constructor(
			private readonly phrase: Phrase,
			private readonly program: Program)
		{ }
		
		/** */
		maybeCompile()
		{
			if (this.compiledType !== undefined)
				return this.compiledType;
			
			return this.compiledType = Type.construct(this.phrase, this.program);
		}
		
		/** */
		private compiledType: Type | null | undefined = undefined;
	}
}
