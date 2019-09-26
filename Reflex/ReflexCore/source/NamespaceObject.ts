
namespace Reflex.Core
{
	export type ConstructBranchFn = (...args: any[]) => IBranch;
	
	/**
	 * 
	 */
	export function createNamespaceObject<TNamespace>(global: any, library: ILibrary): TNamespace
	{
		RoutingLibrary.addLibrary(library);
		
		/** */
		(function maybeAssignGlobals()
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
		})();
		
		/**
		 * Creates the function that exists at the top of the library,
		 * which is used for inserting textual content into the tree.
		 */
		const namespaceFn = (
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
		
		return <any>new Proxy(namespaceFn, {
			get(target: Function, key: string)
			{
				if (typeof key !== "string")
					throw new Error("Unknown property.");
				
				if (key === "call" || key === "apply")
					throw new Error("call() and apply() are not supported.");
				
				if (key in staticMembers)
					return staticMembers[key];
				
				if (library.getDynamicBranch)
				{
					const branch = library.getDynamicBranch(key);
					if (branch)
						return createBranchFn(() => branch);
				}
				
				if (library.getDynamicNonBranch)
					return library.getDynamicNonBranch(key);
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
