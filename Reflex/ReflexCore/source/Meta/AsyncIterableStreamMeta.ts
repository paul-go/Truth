
namespace Reflex.Core
{
	/**
	 * 
	 */
	export class AsyncIterableStreamMeta extends StreamMeta
	{
		constructor(
			readonly containerMeta: ContainerMeta,
			readonly iterator: AsyncIterable<any>)
		{
			super(containerMeta);
		}
		
		/**
		 * Returns the input ref value, or the last synchronously inserted meta.
		 */
		attach(containingBranch: IBranch, tracker: Tracker)
		{
			ReadyState.inc();
			
			(async () =>
			{
				const localTracker = tracker.derive();
				localTracker.update(this.locator);
				
				const branchMeta = BranchMeta.of(containingBranch)!;
				
				for await (const iterableResult of this.iterator)
				{
					const resultMetas = CoreUtil.translateAtomics(
						containingBranch,
						branchMeta,
						iterableResult);
					
					for (const resultMeta of resultMetas)
						resultMeta.locator.setContainer(this.locator);
					
					CoreUtil.applyMetas(
						containingBranch,
						this,
						resultMetas,
						localTracker);
				}
				
				ReadyState.dec();
			})();
		}
	}
}
