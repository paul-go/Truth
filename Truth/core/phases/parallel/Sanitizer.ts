
namespace Truth
{
	/**
	 * A class that encapsulates the actual fault detection behavior,
	 * with facilities to perform analysis on Parallel instances, before
	 * the actual base has been applied to it.
	 */
	export class Sanitizer
	{
		/** */
		constructor(
			private readonly targetParallel: ExplicitParallel,
			private readonly proposedBase: ExplicitParallel,
			private readonly proposedEdge: HyperEdge,
			private readonly cruft: CruftCache) { }
		
		/**
		 * Detects list operartor conflicts between the fragments of an
		 * annotation. For example, conflicts of the following type are
		 * caught here:
		 * 
		 * List : Item
		 * List : Item...
		 */
		detectListFragmentConflicts()
		{
			const sources = this.proposedEdge.fragments;
			if (sources.length === 0)
				return false;
			
			const spans = sources.filter((src): src is Span => src instanceof Span);
			const terms = spans
				.map(f => f.boundary.subject)
				.filter((sub): sub is Term => sub instanceof Term);
			
			const termsList = terms.filter(id => id.isList);
			const termsNonList = terms.filter(id => !id.isList);
			
			if (termsList.length > 0 && termsNonList.length > 0)
				for (const span of spans)
					this.addFault(span, Faults.ListAnnotationConflict);
			
			return this.foundCruft;
		}
		
		/** */
		detectCircularReferences()
		{
			const circularEdgePaths: HyperEdge[][] = [];
			const recurse = (
				srcBase: ExplicitParallel,
				path: HyperEdge[]) =>
			{
				for (const { base, edge } of this.basesOf(srcBase))
				{
					if (path.includes(edge))
						circularEdgePaths.push(path.slice());
					else
						recurse(base, path.concat(edge));
				}
			};
			
			for (const { base, edge } of this.basesOf(this.targetParallel))
				recurse(base, []);
			
			for (const item of circularEdgePaths)
				for (const circularEdge of item)
					this.addFault(circularEdge, Faults.CircularTypeReference);
			
			return this.foundCruft;
		}
		
		/** */
		detectListDimensionalityConflict()
		{
			const targetDim = this.targetParallel.getListDimensionality();
			
			const proposedDim = 
				this.proposedBase.getListDimensionality() +
				(this.proposedEdge.isList ? 1 : 0);
			
			if (targetDim !== proposedDim)
				this.addFault(this.proposedEdge, Faults.ListDimensionalDiscrepancyFault);
			
			return this.foundCruft;
		}
		
		/** Gets a boolean value that indicates whether a fault has been reported. */
		get foundCruft()
		{
			return this._foundCruft;
		}
		private _foundCruft = false;
		
		/** */
		private *basesOf(par: ExplicitParallel)
		{
			for (const { base, edge } of par.eachBase())
				yield { base, edge };
			
			if (this.targetParallel === par)
				yield { base: this.proposedBase, edge: this.proposedEdge };
		}
		
		/** */
		private addFault(source: TCruft, relevantFaultType: FaultType)
		{
			this._foundCruft = true;
			this.cruft.add(source, relevantFaultType);
		}
	}
}
