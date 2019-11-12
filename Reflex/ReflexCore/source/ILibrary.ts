
namespace Reflex.Core
{
	/**
	 * The interface that Reflex libraries (Reflex ML, Reflex SS, etc)
	 * must implement. 
	 */
	export interface ILibrary
	{
		/**
		 * Reflexive libraries must implement this method, so that the
		 * Reflex Core can determine the originating library of a given
		 * object. The library should return a boolean value indicating
		 * whether the library is able to operate on the object specified.
		 */
		isKnownBranch(branch: IBranch): boolean;
		
		/**
		 * Reflexive libraries may implement this method in order to provide
		 * the system with knowledge of whether a branch has been disposed,
		 * which it uses for performance optimizations. If the library has no
		 * means of doing this, it may return "null".
		 */
		isBranchDisposed?: (branch: IBranch) => boolean;
		
		/**
		 * 
		 */
		getStaticBranches?: () => { [name: string]: any } | undefined;
		
		/**
		 * Reflexive libraries that have static members in their namespace must
		 * return them as an object in this method.
		 */
		getStaticNonBranches?: () => { [name: string]: any } | undefined;
		
		/**
		 * 
		 */
		getDynamicBranch?: (name: string) => IBranch;
		
		/**
		 * Reflexive libraries must implement this function to create abstract
		 * top-level container branches.
		 * 
		 * This function should be implemented by libraries that use the
		 * container namespace variant.
		 */
		getDynamicNonBranch?: (name: string) => any;
		
		/**
		 * 
		 */
		getRootBranch?: () => IBranch;
		
		/**
		 * Reflexive libraries that are implemented with the leaf namespace
		 * variant use this method to convert values passed into the namespace
		 * object's tagged template function into objects that may be interpreted
		 * as display text.
		 */
		getLeaf?: (leaf: any) => any;
		
		/**
		 * Reflexive libraries that support inline target+children closures
		 * must provide an implementation for this method.
		 */
		getChildren(target: IBranch): Iterable<IBranch | ILeaf>;
		
		/**
		 * 
		 */
		swapBranches(branch1: IBranch, branch2: IBranch): void;
		
		/**
		 * 
		 */
		replaceBranch(branch1: IBranch, branch2: IBranch): void;
		
		/**
		 * 
		 */
		attachAtomic(atomic: any, branch: IBranch, ref: Ref): void;
		
		/**
		 * 
		 */
		detachAtomic(atomic: any, branch: IBranch): void;
		
		/**
		 * 
		 */
		attachAttribute(branch: IBranch, key: string, value: any): void;
				
		/**
		 * 
		 */
		detachAttribute(branch: IBranch, key: string): void;
		
		/**
		 * Reflexive libraries can hijack the on(), once() and only() functions
		 * to provide their own custom behavior by overriding this method.
		 * 
		 * If the method returns undefined, the recurrent function creation
		 * facilities built into the Reflex Core are used.
		 */
		createRecurrent?: (
			kind: RecurrentKind,
			selector: any,
			callback: RecurrentCallback<Atomic>,
			rest: any[]) => any
		
		/**
		 * Reflexive libraries that contribute to the global on() function
		 * must provide an implementation for this method.
		 * 
		 * Libraries must implement this function in order to provide their own
		 * hooks into the global recurrent functions (such as on(), only() and once()).
		 * 
		 * If the library does not recognize the selector provided, it should
		 * return false, so that the Reflex engine can find another place to
		 * perform the attachment. In other cases, it should return true.
		 */
		attachRecurrent?: (
			kind: RecurrentKind,
			target: IBranch,
			selector: any,
			callback: RecurrentCallback<Atomic>,
			rest: any[]) => boolean;
		
		/**
		 * Reflexive libraries that contribute to the global off() function
		 * must provide an implementation for this method.
		 */
		detachRecurrent?: (
			branch: IBranch,
			selector: any,
			callback: RecurrentCallback<Atomic>) => void;
		
		/**
		 * Reflexive libraries can implement this function in order
		 * to capture the flow of branches being passed as
		 * atomics to other branch functions.
		 */
		handleBranchFunction?: (
			branch: IBranch,
			branchFn: (...atomics: any[]) => IBranch) => void;
		
		/**
		 * Reflexive libraries can implement this function in order to process
		 * a branch before it's returned from a branch function. When this
		 * function is implemented, the return value of the branch functions
		 * are replaced with the return value of this function. Reflexive libraries
		 * that require the standard behavior of returning branches from the
		 * branch functions should return the `branch` argument to this function
		 * verbatim.
		 */
		returnBranch?: (branch: IBranch) => string | number | bigint | object;
	}
}
