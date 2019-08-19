
namespace Reflex.Core
{
	/**
	 * 
	 */
	export class BranchMeta extends ContainerMeta
	{
		/**
		 * Returns the ContentMeta object that corresponds
		 * to the specified content object.
		 */
		static of(branch: IBranch)
		{
			return this.metas.get(branch) || null;
		}
		
		/** */
		private static readonly metas = new WeakMap<IBranch, BranchMeta>();
		
		/** */
		constructor(
			branch: IBranch,
			initialPrimitives: Primitive[],
			locator?: Locator)
		{
			super(locator || new Locator(LocatorType.branch));
			this.branch = branch;
			BranchMeta.metas.set(branch, this);
			
			if (initialPrimitives.length)
			{
				const metas = CoreUtil.translatePrimitives(
					branch,
					this,
					initialPrimitives);
				
				CoreUtil.applyMetas(branch, this, metas);
			}
		}
		
		/**
		 * @internal
		 * WARNING: Do not hold onto references to this
		 * value, or memory leaks will happen.
		 * 
		 * (Note: this property is a bit of a code smell. The usages
		 * of it should be replaced with code that re-discovers the
		 * branch object.)
		 */
		readonly branch: IBranch;
		
		/**
		 * An arbitrary unique value used to identify an index in an effect array
		 * that was responsible for rendering this BranchMeta.
		 */
		key = 0;
	}
}
