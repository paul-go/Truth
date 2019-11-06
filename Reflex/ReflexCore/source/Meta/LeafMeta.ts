
namespace Reflex.Core
{
	/** */
	export class LeafMeta extends StemMeta
	{
		/**
		 * Returns the LeafMeta object that corresponds
		 * to the specified Leaf object.
		 */
		static of(leaf: ILeaf)
		{
			return this.metas.get(leaf) || null;
		}
		
		/** */
		private static readonly metas = new WeakMap<ILeaf, LeafMeta>();
		
		/** */
		constructor(
			readonly value: ILeaf,
			locator?: Locator)
		{
			super(locator);
			LeafMeta.metas.set(value, this);
		}
		
		/**
		 * An arbitrary unique value used to identify an index in a force
		 * array that was responsible for rendering this BranchMeta.
		 */
		key = 0;
	}
}
