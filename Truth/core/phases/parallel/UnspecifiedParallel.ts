
namespace Truth
{
	/**
	 * 
	 */
	export class UnspecifiedParallel extends Parallel
	{
		/**
		 * @internal
		 * Invoked by ParallelCache. Do not call.
		 */
		constructor(
			phrase: Phrase,
			container: Parallel | null)
		{
			super(phrase, container);
		}
		
		/**
		 * Avoids erroneous structural type compatibility with Parallel.
		 */
		private readonly unique: undefined;
	}
}
