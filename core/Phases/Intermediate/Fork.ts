
namespace Truth
{
	/**
	 * 
	 */
	export class Fork extends AbstractClass
	{
		constructor(
			/**
			 * Stores the Phrase from which this Fork originated.
			 */
			readonly predecessor: Phrase,
			/**
			 * Stores an array of phrases that refer to the "prongs" of the fork,
			 * or the phrases to which this Fork points. This array will be empty
			 * in the case when an annotation placed on the influencing statement
			 * is actually an alias.
			 */
			readonly successors: readonly Phrase[],
			/**
			 * Stores the term that is responsible for influencing the creation
			 * of this Fork. The term may refer to an alias, or a literal Fact reference.
			 */
			readonly term: Term)
		{
			super();
		}
		
		/** @internal */
		readonly class = Class.fork;
	}
}
