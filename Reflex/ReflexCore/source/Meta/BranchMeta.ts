
namespace Reflex.Core
{
	/**
	 * 
	 */
	export class BranchMeta extends ContainerMeta
	{
		/**
		 * Returns the BranchMeta object that corresponds
		 * to the specified Branch object.
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
			initialAtomics: Atomic[],
			locator?: Locator)
		{
			super(locator || new Locator(LocatorType.branch));
			this.branch = branch;
			BranchMeta.metas.set(branch, this);
			
			if (initialAtomics.length)
			{
				const metas = CoreUtil.translateAtomics(
					branch,
					this,
					initialAtomics);
				
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
		 * An arbitrary unique value used to identify an index in a force
		 * array that was responsible for rendering this BranchMeta.
		 */
		key = 0;
	}
}
