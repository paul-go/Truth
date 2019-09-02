
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
			const effectArray: ArrayReflex<any> = rec.selector;
			const restArgs = rec.userRestArgs.slice();
			
			for (let i = -1; ++i < effectArray.length;)
			{
				const item = effectArray[i];
				
				const primitives = rec.userCallback(
					item,
					containingBranch,
					i,
					...restArgs);
				
				const metas = CoreUtil.translatePrimitives(
					containingBranch,
					this.containerMeta,
					primitives);
				
				CoreUtil.applyMetas(
					containingBranch,
					this.containerMeta,
					metas,
					localTracker);
			}
			
			ReflexUtil.attachReflex(effectArray.added, (item: any, position: number) =>
			{
				const primitives = rec.userCallback(item, containingBranch, position);

				const metas = CoreUtil.translatePrimitives(
					containingBranch,
					this.containerMeta,
					primitives);
				
				CoreUtil.applyMetas(
					containingBranch,
					this.containerMeta,
					metas,
					localTracker);
			});

			const findMeta = (position: number) => 
			{	
				const iterator = RoutingLibrary.this.getChildren(containingBranch);
				for(const item of iterator) 
				{
					const Meta = BranchMeta.of(item);
					if(Meta && 
						Meta.locator.compare(this.locator) == CompareResult.lower &&
						--position === -1) 
					{
						return Meta;
					}
				}
			}
			
			ReflexUtil.attachReflex(effectArray.removed, (item: any, position: number) =>
			{
				const meta = findMeta(position);
				if(meta)
					CoreUtil.unapplyMetas(containingBranch, [ meta ]);
			});
			
			ReflexUtil.attachReflex(effectArray.swaped, (e1: any, e2: any, i1: number, i2: number) =>
			{
				const source = findMeta(i1)!;
				const target = findMeta(i2)! || null;
				if(source) 
					RoutingLibrary.this.swapElement(containingBranch, source.branch, target.branch);
			});
		}
		
		/** */
		private filterRendered(rendered: Meta[])
		{
			const metas = rendered.slice();
			
			for (let i = metas.length; i-- > 0;)
			{
				const meta = metas[i];
				
				if (meta instanceof BranchMeta || meta instanceof ContentMeta)
				{
					meta.key = ++this.nextMetaKey;
					rendered.splice(i, 1);
				}
			}
			
			return metas;
		}
		
		private nextMetaKey = 0;
		
		/** */
		private unfilterRendered(key: number, containingBranch: IBranch)
		{
			const resolved: Meta[] = [];
			const iterator = RoutingLibrary.this.getChildren(containingBranch);
			let inRange = false;
			
			for (const child of iterator)
			{
				const childMeta = 
					BranchMeta.of(<any>child) ||
					ContentMeta.of(<any>child);
					
				if (childMeta && childMeta.key === key)
				{
					inRange = true;
					resolved.push(childMeta);
				}
				else if (inRange)
					break;
			}
			
			return resolved;
		}
	}
	
	type ArrayItemRendererFn = (item: any, branch: IBranch, index: number) => any;
}
