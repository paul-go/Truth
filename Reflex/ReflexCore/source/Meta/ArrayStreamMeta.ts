
namespace Reflex.Core
{
	/**
	 * 
	 */
	export class ArrayStreamMeta extends StreamMeta
	{
		constructor(
			readonly containerMeta: ContainerMeta,
			readonly recurrent: Recurrent)
		{
			super(containerMeta);
		}
		
		/**
		 * 
		 */
		attach(containingBranch: IBranch, tracker: Tracker)
		{
			const localTracker = tracker.derive();
			localTracker.update(this.locator);
			
			const rec = this.recurrent;
			const arrayForce: ArrayForce<any> = rec.selector;
			const restArgs = rec.userRestArgs.slice();
			
			for (let i = -1; ++i < arrayForce.length;)
			{
				const fo = arrayForce[i];
				
				const atoms = rec.userCallback(
					fo,
					containingBranch,
					i,
					...restArgs);
				
				const metas = CoreUtil.translateAtoms(
					containingBranch,
					this.containerMeta,
					atoms);
				
				CoreUtil.applyMetas(
					containingBranch,
					this.containerMeta,
					metas,
					localTracker);
			}

			const findMeta = (position: number) => 
			{	
				let pos = position;
				const iterator = RoutingLibrary.this.getChildren(containingBranch);
				for (const item of iterator) 
				{
					const Meta = BranchMeta.of(item);
					if (Meta && 
						Meta.locator.compare(this.locator) === CompareResult.lower &&
						--pos === -1) 
					{
						return Meta;
					}
				}
			};
			
			ForceUtil.attachForce(arrayForce.root.changed, (item: any, position: number) => 
			{
				const internalPos = arrayForce.positions.indexOf(position);
				if (position > -1) 
				{
					const meta = findMeta(internalPos);
					if (meta)
					{
						const atoms = rec.userCallback(item, containingBranch, position);
						const metas = CoreUtil.translateAtoms(
							containingBranch,
							this.containerMeta,
							atoms)[0] as BranchMeta;
							
						metas.locator.setContainer(this.containerMeta.locator);
						RoutingLibrary.this.replaceBranch(meta.branch, metas.branch);
					}
				}
			});
			
			ForceUtil.attachForce(arrayForce.added, (item: any, position: number) =>
			{
				const atoms = rec.userCallback(item, containingBranch, position);
				
				const metas = CoreUtil.translateAtoms(
					containingBranch,
					this.containerMeta,
					atoms);
					
				let tracker = localTracker;
				
				if (position < arrayForce.length)
				{
					const meta = findMeta(position - 1);
					if (meta)
					{
						tracker = localTracker.derive();
						tracker.update(meta.branch);
					}
				}
					
				CoreUtil.applyMetas(
					containingBranch,
					this.containerMeta,
					metas,
					tracker);
			});
						
			ForceUtil.attachForce(arrayForce.removed, (item: any, position: number) =>
			{
				const meta = findMeta(position);
				if (meta)
					CoreUtil.unapplyMetas(containingBranch, [meta]);
			});
			
			ForceUtil.attachForce(arrayForce.moved, (item1: any, item2: any, index1: number, index2: number) =>
			{
				const source = findMeta(index1);
				const target = findMeta(index2);

				if (source && target)
				{
					const srcLocVal = source.locator.getLastLocatorValue();
					const targetLocVal = target.locator.getLastLocatorValue();
					source.locator.setLastLocatorValue(targetLocVal);
					target.locator.setLastLocatorValue(srcLocVal);

					RoutingLibrary.this.swapBranches(source.branch, target.branch);
				}
			});
			
			ForceUtil.attachForce(arrayForce.tailChange, (item: any, position: number) =>
			{
				const source = findMeta(position);
				if (source)
					localTracker.update(source.branch);
			});
		}
	}
}
