
//
// This is a debug-only tool that provides a way
// to identify the children of each parent.
//

namespace Reflex.Core
{
	/** */
	let bufferEnabled = true;
	
	/** */
	let childMetas = new WeakMap<IBranch, Meta[]>();
	
	/**
	 * 
	 */
	export const Buffer = "DEBUG" && new class Buffer
	{
		/** */
		enable()
		{
			bufferEnabled = true;
		}
		
		/** 
		 * Returns an array containing the Meta objects that 
		 * are logical children of the specified branch.
		 * (Not available if the buffer is disabled.)
		 */
		childrenOf(branch: IBranch)
		{
			return childMetas.get(branch) || [];
		}
		
		/**
		 * @internal
		 * Populates the internal weak map that allows
		 * branches to store their child meta objects. 
		 * Do not call from application code.
		 */
		add(branch: IBranch, meta: Meta)
		{
			if (bufferEnabled)
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
	};
}
