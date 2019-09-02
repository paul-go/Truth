
namespace Reflex.Core
{
	/**
	 * A class that must be implemented by all reflexive libraries.
	 */
	export abstract class Library<TNamespace = any>
	{
		constructor(global: any)
		{
			this.namespace = this.createNamespace();
			
			const createGlobal = (kind: RecurrentKind) => (
				selector: any,
				callback: RecurrentCallback<Primitives<any>>,
				...rest: any[]) =>
			{
				const customRecurrent = this.createRecurrent(kind, selector, callback, rest);
				if (customRecurrent !== undefined)
					return customRecurrent;
				
				// Could parse the selector here, see if you have any on-on's,
				// if you do, call the functions to augment the return value.
				// Alternatively, we could inline the support for effect arrays.
				return new Recurrent(kind, selector, callback, rest);
			};
			
			if (typeof global.on !== "function")
				global.on = createGlobal(RecurrentKind.on);
			
			if (typeof global.once !== "function")
				global.once = createGlobal(RecurrentKind.once);
			
			if (typeof global.only !== "function")
				global.only = createGlobal(RecurrentKind.only);
			
			RoutingLibrary.addLibrary(this);
		}
		
		/** */
		private createNamespace(): TNamespace
		{
			const staticMembers = this.getNamespaceStatic();
			const computedMemberFn = this.getNamespaceComputed();
			
			if (!staticMembers && !computedMemberFn)
				throw new Error("Library must provide static and/or computed members.");
			
			// In the case when there are no computed members, we can just
			// return the static namespace members, and avoid use of Proxies
			// all together.
			if (!computedMemberFn)
				return <any>staticMembers;
			
			const nsFn = this.createNamespaceFunction();
			const library = this;
			
			return <any>new Proxy(nsFn, {
				get(target: Function, key: string)
				{
					if (typeof key !== "string")
						throw new Error("Unknown property.");
					
					if (key === "call" || key === "apply")
						throw new Error("call() and apply() are not supported.");
					
					if (staticMembers)
						if (key in staticMembers)
							return staticMembers[key];
					
					if (computedMemberFn)
					{
						const member = computedMemberFn(key);
						
						if (member === ComputedMemberType.branch)
							return (...primitives: Primitive[]) =>
								new BranchMeta(
									library.createBranch(key),
									primitives).branch;
						
						if (member !== ComputedMemberType.unrecognized)
							return member;
					}
				}
			});
		}
		
		/**
		 * Creates the function that exists at the top of the library,
		 * which is used for inserting textual content into the tree.
		 */
		private createNamespaceFunction()
		{
			return (
				template: TemplateStringsArray | StatefulReflex,
				...values: (IBranch | StatefulReflex)[]): any =>
			{
				const array = Array.isArray(template) ?
					template :
					[template];
				
				const out: object[] = [];
				const len = array.length + values.length;
				
				// TODO: This should be optimized so that multiple repeating
				// string values don't result in the creation of many ContentMeta
				// objects.
				
				for (let i = -1; ++i < len;)
				{
					const val = i % 2 === 0 ?
						array[i / 2] :
						values[(i - 1) / 2];
					
					if (val === null || val === undefined)
						continue;
					
					if (val instanceof StatefulReflex)
					{
						out.push(new Recurrent(
							RecurrentKind.on,
							val,
							now =>
							{
								const result = this.prepareContent(now);
								if (result)
									new ContentMeta(result);
								
								return result;
							}).run());
					}
					else
					{
						const prepared = this.prepareContent(val);
						if (prepared)
							out.push(prepared);
					}
				}
				
				for (const object of out)
					new ContentMeta(object);
				
				return out;
			};
		}
		
		/**
		 * Stores the object that the reflexive library uses to access all
		 * branches. (For example, in Reflex ML, this is the "ml" object).
		 */
		readonly namespace: TNamespace;
		
		/**
		 * Reflexive libraries must implement this method, so that the
		 * Reflex Core can determine the originating library of a given
		 * object. The library should return a boolean value indicating
		 * whether the library is able to operate on the object specified.
		 */
		abstract isKnownBranch(branch: IBranch): boolean;
		
		/**
		 * Reflexive libraries that have static members in their namespace must
		 * return them as an object in this method.
		 */
		abstract getNamespaceStatic(): { [name: string]: any } | null;
		
		/**
		 * Reflexive libraries that have computed members in their namespace must
		 * provide a function to generate the member in this function.
		 */
		abstract getNamespaceComputed(): ((memberName: string) => unknown) | null;
		
		/**
		 * 
		 */
		abstract createBranch(name: string): IBranch;
		
		/**
		 * Reflexive libraries that support inline target+children closures
		 * must provide an implementation for this method.
		 */
		abstract getChildren(target: IBranch): Iterable<IBranch | IContent>;
		
		/**
		 * Reflexive libraries may implement this method in order to provide
		 * the system with knowledge of whether a branch has been disposed,
		 * which it uses for performance optimizations. If the library has no
		 * means of doing this, it may return "null".
		 */
		abstract isBranchDisposed(branch: IBranch): boolean | null;
		
		/**
		 * Reflexive libraries must implement this function to convert values
		 * being processed by the top-level namespace function into other
		 * values that will eventually be applied as primitives.
		 * 
		 * If the provided value is not recognizable as content, the method
		 * should return null.
		 */
		abstract prepareContent(content: any): object | null;
		
		/**
		 * 
		 */
		abstract attachPrimitive(
			primitive: any,
			branch: IBranch,
			ref: Ref): void;
		
		/**
		 * 
		 */
		abstract detachPrimitive(primitive: any, branch: IBranch): void;

		/**
		 * 
		 */
		abstract swapElement(p1: IBranch, p2: IBranch): void;
		
		/**
		 * 
		 */
		abstract attachAttribute(branch: IBranch, key: string, value: any): void;
				
		/**
		 * 
		 */
		abstract detachAttribute(branch: IBranch, key: string): void;
		
		/**
		 * Reflexive libraries can hijack the on(), once() and only() functions
		 * to provide their own custom behavior by overriding this method.
		 * 
		 * If the method returns undefined, the recurrent function creation
		 * facilities built into the Reflex Core are used.
		 */
		createRecurrent(
			kind: RecurrentKind,
			selector: any,
			callback: RecurrentCallback<Primitives>,
			rest: any[]): any
		{ }
		
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
		abstract attachRecurrent(
			kind: RecurrentKind,
			target: IBranch,
			selector: any,
			callback: RecurrentCallback<Primitives>,
			rest: any[]): boolean;
		
		/**
		 * Reflexive libraries that contribute to the global off() function
		 * must provide an implementation for this method.
		 */
		abstract detachRecurrent(
			branch: IBranch,
			selector: any,
			callback: RecurrentCallback<Primitives>): void;
	}
	
	/** */
	export const ComputedMemberType = Object.freeze({
		
		/**
		 * Indicates that the library doesn't know how to deal with
		 * the specified member name.
		 */
		unrecognized: Object.freeze({}),
		
		/**
		 * Indicates that the member name refers to a function
		 * that returns a branch.
		 */
		branch: Object.freeze({})
	});
}
