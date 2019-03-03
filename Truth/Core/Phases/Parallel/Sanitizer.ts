import * as X from "../../X";


/**
 * A class that encapsulates the actual fault detection behavior,
 * with facilities to perform analysis on Parallel instances, before
 * the actual base has been applied to it.
 */
export class Sanitizer
{
	/** */
	constructor(
		private readonly targetParallel: X.SpecifiedParallel,
		private readonly proposedBase: X.SpecifiedParallel,
		private readonly proposedEdge: X.HyperEdge,
		private readonly cruft: X.CruftCache) { }
	
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
		
		const spans = sources.filter((src): src is X.Span => src instanceof X.Span);
		const identifiers = spans
			.map(f => f.boundary.subject)
			.filter((sub): sub is X.Identifier => sub instanceof X.Identifier);
		
		const identifiersList = identifiers.filter(id => id.isList);
		const identifiersNonList = identifiers.filter(id => !id.isList);
		
		if (identifiersList.length > 0 && identifiersNonList.length > 0)
			for (const span of spans)
				this.addFault(span, X.Faults.ListAnnotationConflict);
		
		return this.foundCruft;
	}
	
	/** */
	detectCircularReferences()
	{
		const circularEdgePaths: X.HyperEdge[][] = [];
		const recurse = (
			srcBase: X.SpecifiedParallel,
			path: X.HyperEdge[]) =>
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
				this.addFault(circularEdge, X.Faults.CircularTypeReference);
		
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
			this.addFault(this.proposedEdge, X.Faults.ListDimensionalDiscrepancyFault);
		
		return this.foundCruft;
	}
	
	/** Gets a boolean value that indicates whether a fault has been reported. */
	get foundCruft()
	{
		return this._foundCruft;
	}
	private _foundCruft = false;
	
	/** */
	private *basesOf(par: X.SpecifiedParallel)
	{
		for (const { base, edge } of par.eachBase())
			yield { base, edge };
		
		if (this.targetParallel === par)
			yield { base: this.proposedBase, edge: this.proposedEdge };
	}
	
	/** */
	private addFault(source: X.TCruft, relevantFaultType: X.FaultType)
	{
		this._foundCruft = true;
		this.cruft.add(source, relevantFaultType);
	}
}
