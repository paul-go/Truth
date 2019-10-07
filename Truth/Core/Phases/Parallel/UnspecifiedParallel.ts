
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
			uri: Uri,
			container: Parallel | null)
		{
			super(uri, container);
		}
		
		/**
		 * Avoids erroneous structural type compatibility with Parallel.
		 */
		private readonly unique: undefined;
	}
}
