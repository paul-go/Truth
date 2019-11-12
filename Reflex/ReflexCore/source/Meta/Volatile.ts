
namespace Reflex.Core
{
	/**
	 * A base class for types that can be applied
	 * as an atomic by some the Reflexive library.
	 */
	export abstract class Volatile
	{
		protected constructor() { }
		
		/**
		 * A function that converts this Volatile instance
		 * into an Atomic that will eventually be applied
		 * to the specified branch.
		 */
		atomicize(info: IAtomicizeInfo): Atomic { }
		
		/** Enforce nominal type. */
		private readonly volatile: undefined;
	}
	
	/** */
	export interface IAtomicizeInfo
	{
		/**
		 * Stores a reference to the branch to which the atomic
		 * will eventually be attached.
		 */
		readonly eventualBranch: IBranch;
		
		/**
		 * Stores information about where specifically the atomic
		 * will eventually be attached in the Branch.
		 */
		readonly eventualRef: Ref;
	}
}
