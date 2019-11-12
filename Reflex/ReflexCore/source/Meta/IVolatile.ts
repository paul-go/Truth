
namespace Reflex.Core
{
	/**
	 * A base class for types that can be applied
	 * as an atomic by some the Reflexive library.
	 */
	export interface IVolatile<B = IBranch, L = ILeaf>
	{
		/**
		 * A function or method that converts this IVolatile
		 * instance into an Atomic that will eventually be
		 * applied to the specified branch.
		 */
		atomize(info: IAtomizeInfo<B, L>): Atomic;
	}
	
	/** */
	export interface IAtomizeInfo<B = IBranch, L = ILeaf>
	{
		/**
		 * Stores a reference to the branch to which the atomic
		 * will eventually be attached.
		 */
		readonly eventualBranch: B;
		
		/**
		 * Stores information about where specifically the atomic
		 * will eventually be attached in the Branch.
		 */
		readonly eventualRef: Ref<B, L>;
	}
}
