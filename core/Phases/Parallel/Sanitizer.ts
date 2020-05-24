
namespace Truth
{
	/**
	 * @internal
	 * A class that encapsulates the actual fault detection behavior,
	 * with facilities to perform analysis on Parallel instances, before
	 * the actual base has been applied to it.
	 */
	export class Sanitizer
	{
		/** */
		constructor(
			private readonly sourceParallel: ExplicitParallel,
			private readonly proposedBaseParallel: ExplicitParallel,
			private readonly viaFork: Fork,
			private readonly cruft: CruftCache) { }
		
		/**
		 * Detects list operartor conflicts between the fragments of an
		 * annotation. For example, conflicts of the following facts are
		 * caught here:
		 * 
		 * List : Item
		 * List : Item...
		 */
		detectListFragmentConflicts()
		{
			const sources = this.viaFork.predecessor.annotations;
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
			const circularForkPaths: Fork[][] = [];
			const recurse = (srcBase: ExplicitParallel, path: Fork[]) =>
			{
				for (const { base, fork } of this.basesOf(srcBase))
				{
					if (path.includes(fork))
						circularForkPaths.push(path.slice());
					else
						recurse(base, path.concat(fork));
				}
			};
			
			for (const { base } of this.basesOf(this.sourceParallel))
				recurse(base, []);
			
			for (const item of circularForkPaths)
				for (const circularEdge of item)
					this.addFault(circularEdge, Faults.CircularFactReference);
			
			return this.foundCruft;
		}
		
		/** */
		detectListDimensionalityConflict()
		{
			const targetDim = this.sourceParallel.getListDimensionality();
			
			const proposedDim = 
				this.proposedBaseParallel.getListDimensionality() +
				(this.viaFork.term.isList ? 1 : 0);
			
			if (targetDim !== proposedDim)
				this.addFault(this.viaFork, Faults.ListDimensionalDiscrepancyFault);
			
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
			for (const { base, fork } of par.eachBase())
				if (fork)
					yield { base, fork };
			
			if (this.sourceParallel === par)
				yield { base: this.proposedBaseParallel, fork: this.viaFork };
		}
		
		/** */
		private addFault(source: TCruft, relevantFaultType: FaultType)
		{
			this._foundCruft = true;
			this.cruft.add(source, relevantFaultType);
		}
	}
}
