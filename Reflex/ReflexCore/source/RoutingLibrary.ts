
namespace Reflex.Core
{
	/**
	 * @internal
	 * 
	 * A class that sits between the specific Reflexive library, 
	 * and the Library class as defined in the Reflex Core. The
	 * purpose of this class is to override all the methods, and
	 * determine the specific library to route each call to the 
	 * abstract methods. It operates by looking at the constructor
	 * function of the Branch object provided to all the methods,
	 * and then using this to determine what library is responsible
	 * for objects of this type.
	 */
	export class RoutingLibrary
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
		static addLibrary(library: Library)
		{
			this.libraries.push(library);
		}
		private static readonly libraries: Library[] = [];
		
		private constructor() { }
		
		/**
		 * Returns the library that corresponds to the specified branch.
		 */
		private libraryOf(referenceBranch: IBranch)
		{
			if (referenceBranch)
				for (const lib of RoutingLibrary.libraries)
					if (lib.isKnownBranch(referenceBranch))
						return lib;
			
			throw new Error("Unknown branch type.");
		}
		
		/**
		 * Reflexive libraries that support inline target+children closures
		 * must provide an implementation for this method.
		 */
		getChildren(target: IBranch)
		{
			return this.libraryOf(target).getChildren(target);
		}
		
		/**
		 * Reflexive libraries may implement this method in order to provide
		 * the system with knowledge of whether a branch has been disposed,
		 * which it uses for performance optimizations. If the library has no
		 * means of doing this, it may return "null".
		 */
		isBranchDisposed(branch: IBranch)
		{
			return this.libraryOf(branch).isBranchDisposed(branch);
		}
		
		/**
		 * 
		 */
		attachPrimitive(
			primitive: any,
			branch: IBranch,
			ref: Ref)
		{
			return this.libraryOf(branch).attachPrimitive(primitive, branch, ref);
		}
		
		/**
		 * 
		 */
		detachPrimitive(primitive: any, branch: IBranch)
		{
			return this.libraryOf(branch).detachPrimitive(primitive, branch);
		}
		
		/**
		 *
		 */
		swapElement(targetBranch: IBranch, branch1: IBranch, branch2: IBranch)
		{
			return this.libraryOf(targetBranch).swapElement(branch1, branch2);
		}
		
		/**
		 *
		 */
		replaceElement(targetBranch: IBranch, branch1: IBranch, branch2: IBranch)
		{
			return this.libraryOf(targetBranch).replaceElement(branch1, branch2);
		}
		
		/**
		 * 
		 */
		attachAttribute(branch: IBranch, key: string, value: any)
		{
			return this.libraryOf(branch).attachAttribute(branch, key, value);
		}
				
		/**
		 * 
		 */
		detachAttribute(branch: IBranch, key: string)
		{
			return this.libraryOf(branch).detachAttribute(branch, key);
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
			callback: RecurrentCallback<Primitives>,
			restArguments: any[])
		{
			return this.libraryOf(target).attachRecurrent(
				kind,
				target,
				selector,
				callback,
				restArguments);
		}
		
		/**
		 * Reflexive libraries that contribute to the global off() function
		 * must provide an implementation for this method.
		 */
		detachRecurrent(
			branch: IBranch,
			selector: any,
			callback: RecurrentCallback<Primitives>)
		{
			return this.libraryOf(branch).detachRecurrent(
				branch,
				selector,
				callback);
		}
	}
}
