
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
			library: ILibrary,
			locator?: Locator)
		{
			super(locator);
			this.library = library;
			LeafMeta.metas.set(value, this);
		}
		
		/**
		 * @internal
		 * Stores a reference to the ILibrary that was responsible for
		 * instantiating the underlying branch object.
		 */
		readonly library: ILibrary;
		
		/**
		 * An arbitrary unique value used to identify an index in a force
		 * array that was responsible for rendering this BranchMeta.
		 */
		key = 0;
	}
}
