
namespace Reflex.Core
{
	/** 
	 * WARNING: This method has potential memory issues
	 * and is not intended for long-running processes (i.e. in
	 * the browser). In order to use it from the browser, the
	 * childrenOf.enabled value must be set to true. In Node.js,
	 * this value defaults to true. In the browser, it defaults to
	 * false;
	 * 
	 * @returns An array containing the Meta objects that 
	 * are logical children of the specified branch.
	 */
	export function childrenOf(branch: IBranch)
	{
		return childMetas.get(branch) || [];
	}
	
	export namespace childrenOf
	{
		export let enabled = typeof __dirname === "string";
		
		/**
		 * @internal
		 * Populates the internal weak map that allows
		 * branches to store their child meta objects. 
		 * Do not call from application code.
		 */
		export function store(branch: IBranch, meta: Meta)
		{
			const existing = childMetas.get(branch);
			if (existing)
			{
				if (!existing.includes(meta))
					existing.push(meta);
			}
			else childMetas.set(branch, [meta]);
		}
	}
	
	/** */
	const childMetas = new WeakMap<IBranch, Meta[]>();
}
