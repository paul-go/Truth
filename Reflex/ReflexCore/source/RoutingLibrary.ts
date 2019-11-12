
namespace Reflex.Core
{
	/**
	 * @internal
	 * A class that sits between the specific Reflexive library, 
	 * and the Library class as defined in the Reflex Core. The
	 * purpose of this class is to override all the methods, and
	 * determine the specific library to route each call to the 
	 * abstract methods. It operates by looking at the constructor
	 * function of the Branch object provided to all the methods,
	 * and then using this to determine what library is responsible
	 * for objects of this type.
	 */
	export class RoutingLibrary implements ILibrary
	{
		/**
		 * Singleton accessor property.
		 */
		static get this()
		{
			return this._this === null ?
				this._this = new RoutingLibrary() :
				this._this;
		}
		private static _this: RoutingLibrary | null = null;
		
		/**
		 * Adds a reference to a Reflexive library, which may be
		 * called upon in the future.
		 */
		static addLibrary(library: ILibrary)
		{
			this.libraries.push(library);
		}
		private static readonly libraries: ILibrary[] = [];
		
		private constructor() { }
		
		/**
		 * Conditionally executes the specified library function,
		 * in the case when it's defined.
		 */
		private route<F extends (...args: any[]) => R, R>(
			referenceBranch: IBranch,
			getFn: (library: ILibrary) => F | undefined,
			callFn: (fn: F, thisArg: ILibrary) => R,
			defaultValue?: any): R
		{
			if (referenceBranch)
			{
				const libs = RoutingLibrary.libraries;
				
				// It's important that test for associativity between a
				// branch and a library is done in reverse order, in order
				// to support the case of Reflexive libraries being layered
				// on top of each other. If Reflexive library A is layered on
				// Reflexive library B, A will be added to the libraries array
				// before B. The libraries array therefore has an implicit
				// topological sort. Iterating backwards ensures that the
				// higher-level libraries are tested before the lower-level ones.
				// This is critical, because a higher-level library may operate
				// on the same branch types as the lower-level libraries that
				// it's abstracting.
				for (let i = libs.length; i-- > 0;)
				{
					const lib = libs[i];
					if (lib.isKnownBranch(referenceBranch))
					{
						const libFn = getFn(lib);
						return typeof libFn === "function" ?
							callFn(libFn, lib) :
							defaultValue;
					}
				}
			}
			
			throw new Error("Unknown branch type.");
		}
		
		/**
		 * 
		 */
		isKnownBranch(branch: IBranch)
		{
			return this.route(
				branch,
				lib => lib.isKnownBranch,
				(fn, lib) => fn.call(lib, branch),
				false);
		}
		
		/**
		 * Reflexive libraries may implement this method in order to provide
		 * the system with knowledge of whether a branch has been disposed,
		 * which it uses for performance optimizations. If the library has no
		 * means of doing this, it may return "null".
		 */
		isBranchDisposed(branch: IBranch)
		{
			return this.route(
				branch,
				lib => lib.isBranchDisposed,
				(fn, lib) => fn.call(lib, branch),
				false);
		}
		
		/**
		 * Reflexive libraries that support inline target+children closures
		 * must provide an implementation for this method.
		 */
		getChildren(target: IBranch)
		{
			return this.route(
				target,
				lib => lib.getChildren,
				(fn, lib) => fn.call(lib, target),
				[]);
		}
		
		/**
		 * 
		 */
		getLeaf(leaf: any)
		{
			return this.route(
				leaf,
				lib => lib.getLeaf,
				(fn, lib) => fn.call(lib, leaf),
				null);
		}
		
		/**
		 * 
		 */
		attachAtomic(
			atomic: any,
			branch: IBranch,
			ref: Ref)
		{
			const atomicTranslated = CoreUtil.isVolatile(atomic) ?
				atomic.atomize({ eventualBranch: branch, eventualRef: ref }) :
				atomic;
			
			this.route(
				branch,
				lib => lib.attachAtomic,
				(fn, lib) => fn.call(lib, atomicTranslated, branch, ref));
		}
		
		/**
		 * 
		 */
		detachAtomic(atomic: any, branch: IBranch)
		{
			this.route(
				branch,
				lib => lib.detachAtomic,
				(fn, lib) => fn.call(lib, atomic, branch));
		}
		
		/**
		 *
		 */
		swapBranches(branch1: IBranch, branch2: IBranch)
		{
			this.route(
				branch1,
				lib => lib.swapBranches,
				(fn, lib) => fn.call(lib, branch1, branch2));
		}
		
		/**
		 *
		 */
		replaceBranch(branch1: IBranch, branch2: IBranch)
		{
			this.route(
				branch1,
				lib => lib.replaceBranch,
				(fn, lib) => fn.call(lib, branch1, branch2));
		}
		
		/**
		 * 
		 */
		attachAttribute(branch: IBranch, key: string, value: any)
		{
			this.route(
				branch,
				lib => lib.attachAttribute,
				(fn, lib) => fn.call(lib, branch, key, value));
		}
				
		/**
		 * 
		 */
		detachAttribute(branch: IBranch, key: string)
		{
			this.route(
				branch,
				lib => lib.detachAttribute,
				(fn, lib) => fn.call(lib, branch, key));
		}
		
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
		attachRecurrent(
			kind: RecurrentKind,
			target: IBranch,
			selector: any,
			callback: RecurrentCallback<Atomic>,
			rest: any[])
		{
			return this.route(
				target,
				lib => lib.attachRecurrent,
				(fn, lib) => fn.call(lib, kind, target, selector, callback, rest),
				false);
		}
		
		/**
		 * Reflexive libraries that contribute to the global off() function
		 * must provide an implementation for this method.
		 */
		detachRecurrent(
			branch: IBranch,
			selector: any,
			callback: RecurrentCallback<Atomic>)
		{
			return this.route(
				branch,
				lib => lib.detachRecurrent,
				(fn, lib) => fn.call(lib, branch, selector, callback),
				false);
		}
		
		/**
		 * Reflexive libraries can implement this function in order
		 * to capture the flow of branches being passed as
		 * atomics to other branch functions.
		 */
		handleBranchFunction(
			branch: IBranch,
			branchFn: (...atomics: any[]) => IBranch)
		{
			return this.route(
				branch,
				lib => lib.handleBranchFunction,
				(fn, lib) => fn.call(lib, branch, branchFn));
		}
		
		/**
		 * Reflexive libraries can implement this function in order to process
		 * a branch before it's returned from a branch function. When this
		 * function is implemented, the return value of the branch functions
		 * are replaced with the return value of this function. Reflexive libraries
		 * that require the standard behavior of returning branches from the
		 * branch functions should return the `branch` argument to this function
		 * verbatim.
		 */
		returnBranch(branch: IBranch)
		{
			return this.route(
				branch,
				lib => lib.returnBranch,
				(fn, lib) => fn.call(lib, branch),
				branch)
		}
	}
}
