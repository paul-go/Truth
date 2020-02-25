
namespace Truth
{
	/**
	 * @internal
	 */
	export class Fork extends AbstractClass
	{
		constructor(
			readonly predecessor: Phrase,
			readonly successors: readonly Phrase[])
		{
			super();
		}
		
		/**  */
		readonly class = Class.fork;
	}
}
