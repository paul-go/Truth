
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
			callFn: (fn: F) => R,
			defaultValue?: any): R
		{
			if (referenceBranch)
			{
				for (const lib of RoutingLibrary.libraries)
				{
					if (lib.isKnownBranch(referenceBranch))
					{
						const libFn = getFn(lib);
						return typeof libFn === "function" ?
							callFn(libFn) :
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
				fn => fn(branch),
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
				fn => fn(branch),
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
				fn => fn(target),
				[]);
		}
		
		/**
		 * 
		 */
		prepareContent(content: any)
		{
			return this.route(
				content,
				lib => lib.prepareContent,
				fn => fn(content),
				null);
		}
		
		/**
		 * 
		 */
		attachPrimitive(
			primitive: any,
			branch: IBranch,
			ref: Ref)
		{
			this.route(
				branch,
				lib => lib.attachPrimitive,
				fn => fn(primitive, branch, ref));
		}
		
		/**
		 * 
		 */
		detachPrimitive(primitive: any, branch: IBranch)
		{
			this.route(
				branch,
				lib => lib.detachPrimitive,
				fn => fn(primitive, branch));
		}
		
		/**
		 *
		 */
		swapElement(branch1: IBranch, branch2: IBranch)
		{
			this.route(
				branch1,
				lib => lib.swapElement,
				fn => fn(branch1, branch2));
		}
		
		/**
		 *
		 */
		replaceElement(branch1: IBranch, branch2: IBranch)
		{
			this.route(
				branch1,
				lib => lib.replaceElement,
				fn => fn(branch1, branch2));
		}
		
		/**
		 * 
		 */
		attachAttribute(branch: IBranch, key: string, value: any)
		{
			this.route(
				branch,
				lib => lib.attachAttribute,
				fn => fn(branch, key, value));
		}
				
		/**
		 * 
		 */
		detachAttribute(branch: IBranch, key: string)
		{
			this.route(
				branch,
				lib => lib.detachAttribute,
				fn => fn(branch, key));
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
			rest: any[])
		{
			return this.route(
				target,
				lib => lib.attachRecurrent,
				fn => fn(kind, target, selector, callback, rest),
				false);
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
			return this.route(
				branch,
				lib => lib.detachRecurrent,
				fn => fn(branch, selector, callback),
				false);
		}
	}
}
