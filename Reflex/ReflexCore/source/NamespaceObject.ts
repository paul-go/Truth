
namespace Reflex.Core
{
	export type ConstructBranchFn = (...args: any[]) => IBranch;
	
	/** @internal */
	declare const Deno: any;
	
	/**
	 * Creates a namespace object, which is the object that should contain
	 * all functions in the reflexive library.
	 * 
	 * @param library An object that implements the ILibrary interface,
	 * from which the namespace object will be generated.
	 * 
	 * @param globalize Indicates whether the on/once/only globals should
	 * be appended to the global object (which is auto-detected from the
	 * current environment. If the ILibrary interface provided doesn't support
	 * the creation of recurrent functions, this parameter has no effect.
	 */
	export function createNamespaceObject<TNamespace>(
		library: ILibrary,
		globalize?: boolean): TNamespace
	{
		RoutingLibrary.addLibrary(library);
		
		const glob: any =
			!globalize ? null :
			// Node.js
			(typeof global === "object" && typeof global.setTimeout === "function") ? global :
			// Browser / Deno
			(typeof navigator === "object" || typeof Deno === "object") ? window :
			null;
		
		// We create the on, once, and only globals in the case when we're creating
		// a namespace object for a library that supports recurrent functions.
		if (glob && library.attachRecurrent)
		{
			const createGlobal = (kind: RecurrentKind) => (
				selector: any,
				callback: RecurrentCallback<Primitives<any>>,
				...rest: any[]) =>
			{
				if (library.createRecurrent)
				{
					const customRecurrent = library.createRecurrent(kind, selector, callback, rest);
					if (customRecurrent !== undefined)
						return customRecurrent;
				}
				
				// We could parse the selector here, see if you have any on-on's,
				// if you do, call the functions to augment the return value.
				// Alternatively, we could inline the support for force arrays.
				return new Recurrent(kind, selector, callback, rest);
			};
			
			if (typeof glob.on !== "function")
				glob.on = createGlobal(RecurrentKind.on);
			
			if (typeof glob.once !== "function")
				glob.once = createGlobal(RecurrentKind.once);
			
			if (typeof glob.only !== "function")
				glob.only = createGlobal(RecurrentKind.only);
		}
		
		/**
		 * Creates the function that exists at the top of the library,
		 * which is used for inserting textual content into the tree.
		 */
		const namespaceFn = (
			template: TemplateStringsArray | StatefulForce,
			...values: (IBranch | StatefulForce)[]): any =>
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
				
				if (val instanceof StatefulForce)
				{
					out.push(new Recurrent(
						RecurrentKind.on,
						val,
						now =>
						{
							const result = library.prepareContent(now);
							if (result)
								new ContentMeta(result);
							
							return result;
						}).run());
				}
				else
				{
					const prepared = library.prepareContent(val);
					if (prepared)
						out.push(prepared);
				}
			}
			
			for (const object of out)
				new ContentMeta(object);
			
			return out;
		};
		
		/** */
		const staticMembers = (() =>
		{
			const staticBranches = (() =>
			{
				const branchFns: { [key: string]: (...args: any) => any; } = {};
				
				if (library.getStaticBranches)
				{
					for (const [key, value] of Object.entries(library.getStaticBranches() || {}))
					{
						if (typeof value !== "function")
							continue;
						
						const constructBranchFn: ConstructBranchFn = value;
						branchFns[key] = constructBranchFn.length === 0 ?
							createBranchFn(constructBranchFn) :
							createParameticBranchFn(constructBranchFn);
					}
				}
				
				return branchFns;
			})();
			
			const staticNonBranches = library.getStaticNonBranches ?
				library.getStaticNonBranches() || {}:
				{};
			
			return Object.assign({}, staticBranches, staticNonBranches);
		})();
		
		// In the case when there are no dynamic members, we can just
		// return the static namespace members, and avoid use of Proxies
		// all together.
		if (!library.getDynamicBranch && !library.getDynamicNonBranch)
			return <any>Object.assign(namespaceFn, staticMembers);
		
		// This variable stores an object that contains the members
		// that were attached to the proxy object after it's creation.
		// Currently this is only being used by ReflexML to attach
		// the "emit" function, but others may use it aswell.
		let attachedMembers: { [key: string]: any; } | null = null;
		
		return <any>new Proxy(namespaceFn, {
			get(target: Function, key: string)
			{
				if (typeof key !== "string")
					throw new Error("Unknown property.");
				
				if (key === "call" || key === "apply")
					throw new Error("call() and apply() are not supported.");
				
				if (key in staticMembers)
					return staticMembers[key];
				
				if (attachedMembers && key in attachedMembers)
					return attachedMembers[key];
				
				if (library.getDynamicBranch)
				{
					const branch = library.getDynamicBranch(key);
					if (branch)
						return createBranchFn(() => branch);
				}
				
				if (library.getDynamicNonBranch)
					return library.getDynamicNonBranch(key);
			},
			set(target: Function, p: any, value: any)
			{
				(attachedMembers || (attachedMembers = {}))[p] = value;
				return true;
			}
		});
	}
	
	/**
	 * 
	 */
	export function createBranchFn(constructBranchFn: () => IBranch)
	{
		return (...primitives: Primitive[]) =>
		{
			return new BranchMeta(
				constructBranchFn(),
				primitives).branch;
		};
	};
	
	/**
	 * 
	 */
	export function createParameticBranchFn(branchFn: (...args: any[]) => IBranch)
	{
		return (...constructBranchArgs: any[]) =>
		{
			return (...primitives: Primitive[]) =>
			{
				return new BranchMeta(
					branchFn(constructBranchArgs),
					primitives).branch;
			};
		};
	};
}
