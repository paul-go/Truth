
namespace Reflex.Core
{
	/**
	 * A base class for types that can be applied
	 * as an atomic by some the Reflexive library.
	 */
	export interface IVolatile<B extends object = object, L = any, X = void>
	{
		/**
		 * A function or method that converts this IVolatile
		 * instance into an Atomic that will eventually be
		 * applied to the branch passed in through the 
		 * `destination` argument.
		 */
		atomize(destination: B): Atomic<B, L, X>;
	}
}
