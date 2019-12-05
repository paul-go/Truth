
namespace Reflex.Core
{
	/**
	 * Deals with temporarily tracking inserted metas.
	 * 
	 * One single branch can potentially have multiple trackers
	 * associated with it, in the case when the branch has multiple
	 * layers of stream metas applied to it. There is one tracker instance
	 * for each set of "sibling" metas.
	 */
	export class Tracker
	{
		/** */
		constructor(
			private readonly branch: IBranch,
			ref: Ref | Locator = "append")
		{
			this.last = ref;
		}
		
		/**
		 * Updates the internal tracking value of the Tracker.
		 */
		update(object: Ref | Locator)
		{
			this.last = object;
		}
		
		/**
		 * Returns a value that can be used in a client library as the
		 * reference sibling value to indicate an insertion point.
		 */
		getLastHardRef()
		{
			return this.last instanceof Locator ?
				this.resolveRef() :
				this.last;
		}
		
		/**
		 * Clones and returns this Tracker. Used to create a new
		 * Tracker instance for a more nested level of stream meta.
		 */
		derive()
		{
			const out = new Tracker(this.branch);
			out.last = this.last;
			
			if (Const.debug)
				out.trackerContainer = this;
			
			return out;
		}
		
		/**
		 * Ensures that the specified ref object actually exists in the Reflexive
		 * tree, and if not, a new object is returned that can be used as the ref.
		 * In the case when null is returned, null should be used as the ref,
		 * indicating that the insertion should occur at the end of the child list.
		 */
		private resolveRef(): Ref
		{
			const ref = this.last;
			
			if (ref === null)
				throw new Error("?");
			
			if (ref === "prepend" || ref === "append")
				return ref;
			
			const refLocator = (() =>
			{
				if (ref instanceof Locator)
					return ref;
				
				const refMeta = 
					BranchMeta.of(ref) ||
					LeafMeta.of(ref);
				
				return refMeta ?
					refMeta.locator :
					null;
			})();
			
			if (!refLocator)
				return "append";
			
			const children = RoutingLibrary.this.getChildren(this.branch);
			let previous: IBranch | ILeaf | null = null;
			
			for (const child of children)
			{
				if (ref === child)
					return ref;
				
				const currentChildMeta = 
					BranchMeta.of(child) ||
					LeafMeta.of(child);
				
				if (currentChildMeta)
				{
					// The explanation of this algorithm is that we're walking through
					// the direct child metas of containingBranch. The ideal case is
					// that the meta that was previously being used as the locator is
					// still present in the document. In this case, the ref doesn't need
					// to be updated, so it can just be returned verbatim. However, 
					// in the case when the ref is missing, we need to return the next
					// newest meta that isn't newer than the locator of the original
					// ref.
					const cmp = currentChildMeta.locator.compare(refLocator);
					
					if (cmp === CompareResult.equal)
						return child;
					
					// The current child meta is newer than the ref meta. This means
					// that we went too far, so we should return the previous meta.
					// Or, in the case when we haven't hit a meta yet, we need to
					// return the constant "prepend" (because there's nothing to
					// refer to in this case).
					if (cmp === CompareResult.lower)
						return previous || "prepend";
				}
				
				previous = child;
			}
			
			return "append";
		}
		
		/**
		 * Stores a rolling value that indirectly refers to the last meta
		 * that was appended to the branch that this tracker is tracking.
		 */
		private last: Ref | Locator;
		
		/**
		 * @internal
		 * For debugging only.
		 */
		private trackerContainer: Tracker | undefined;
	}
}
