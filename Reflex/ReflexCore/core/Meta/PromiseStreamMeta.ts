
namespace Reflex.Core
{
	/**
	 * 
	 */
	export class PromiseStreamMeta extends StreamMeta
	{
		constructor(
			readonly containerMeta: ContainerMeta,
			readonly promise: Promise<any>)
		{
			super(containerMeta);
		}
		
		/** */
		attach(containingBranch: IBranch, tracker: Tracker)
		{
			ReadyState.inc();
			
			this.promise.then(result =>
			{
				const containingBranchMeta = BranchMeta.of(containingBranch);
				if (containingBranchMeta)
				{
					CoreUtil.applyMetas(
						containingBranch,
						this.containerMeta,
						CoreUtil.translateAtoms(
							containingBranch,
							containingBranchMeta,
							result),
						tracker);
				}
				
				ReadyState.dec();
			});
		}
	}
}
