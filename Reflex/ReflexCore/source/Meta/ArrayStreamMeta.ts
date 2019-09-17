
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
			
			ReflexUtil.attachReflex(effectArray.root.changed, (item: any, position: number) => 
			{
				const internalPos = effectArray.positions.indexOf(position);
				if (position > -1) 
				{
					const meta = findMeta(internalPos);
					if (meta)
					{
						const primitives = rec.userCallback(item, containingBranch, position);
						const metas = CoreUtil.translatePrimitives(
							containingBranch,
							this.containerMeta,
							primitives)[0] as BranchMeta;
							
						metas.locator.setContainer(this.containerMeta.locator);
						RoutingLibrary.this.replaceElement(containingBranch, meta.branch, metas.branch);
					}
				}
			});
			
			ReflexUtil.attachReflex(effectArray.added, (item: any, position: number) =>
			{
				const primitives = rec.userCallback(item, containingBranch, position);
				
				const metas = CoreUtil.translatePrimitives(
					containingBranch,
					this.containerMeta,
					primitives);
					
				let tracker = localTracker;
				
				if (position < effectArray.length)
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
						
			ReflexUtil.attachReflex(effectArray.removed, (item: any, position: number) =>
			{
				const meta = findMeta(position);
				if (meta)
					CoreUtil.unapplyMetas(containingBranch, [meta]);
			});
			
			ReflexUtil.attachReflex(effectArray.moved, (item1: any, item2: any, index1: number, index2: number) =>
			{
				const source = findMeta(index1);
				const target = findMeta(index2);

				if (source && target)
				{
					const srcLocVal = source.locator.getlastLocatorValue();
					const targetLocVal = target.locator.getlastLocatorValue();
					source.locator.setLastLocatorValue(targetLocVal);
					target.locator.setLastLocatorValue(srcLocVal);

					RoutingLibrary.this.swapElement(containingBranch, source.branch, target.branch);
				}
			});
			
			ReflexUtil.attachReflex(effectArray.tailChange, (item: any, position: number) =>
			{
				const source = findMeta(position);
				if (source)
					localTracker.update(source.branch);
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
