import * as X from "../../X";


/**
 * Encapulates functionality for cleaning up Parallel objects,
 * so that they can be safely referenced by others. The clean
 * up process involves trimming erroneous bases, and 
 * reporting any detected faults.
 */
export class ParallelSanitizer
{
	constructor(
		private readonly program: X.Program,
		private readonly worker: X.ConstructionWorker,
		private readonly cruft: X.CruftCache) { }
	
	/**
	 * Performs verification on the descend operation.
	 * Reports any faults that can occur during this process.
	 */
	verifyDescend(
		zenithParallel: X.SpecifiedParallel,
		descendParallel: X.SpecifiedParallel)
	{
		if (descendParallel.node.subject instanceof X.Anon)
			if (zenithParallel.isListIntrinsic)
				this.program.faults.report(new X.Fault(
					X.Faults.AnonymousInListIntrinsic,
					descendParallel.node.statements[0]));
	}
	
	/**
	 * Attempts to add the specified baseParallel as a base of the
	 * srcParallel. If the addition of the new base would not generate
	 * any critical faults, it is added. Otherwise, it's marked as cruft.
	 */
	tryAddBase(
		srcParallel: X.SpecifiedParallel,
		baseParallel: X.SpecifiedParallel,
		via: X.HyperEdge)
	{
		const sanitizer = new Sanitizer(srcParallel, baseParallel, via, this.cruft);
		
		sanitizer.detectListFragmentConflicts();
		if (sanitizer.foundCruft)
			return false;
		
		// In this case, we only need to do a 
		// shallow check for circular inheritance.
		sanitizer.detectCircularReferences();
		if (sanitizer.foundCruft)
			return false;
		
		if (srcParallel.baseCount > 0)
		{
			sanitizer.detectListDimensionalityConflict();
			if (sanitizer.foundCruft)
				return false;
			
			if (srcParallel.baseCount === 1)
			{
				// In the case when there is exactly one existing base
				// defined on the Parallel, we need to excavate the
				// existing Parallel (because this wouldn't have been
				// done yet, because it's unneccesary when there's
				// only one base).
				const bases = Array.from(srcParallel.eachBase());
				const lastBase = bases[bases.length - 1].base;
				this.worker.excavate(lastBase);
			}
			
			this.worker.excavate(baseParallel);
		}
		
		srcParallel.addBase(baseParallel, via);
		return true;
	}
}


/**
 * A class that encapsulates the actual fault detection behavior,
 * with facilities to perform analysis on Parallel instances, before
 * the actual base has been applied to it.
 */
class Sanitizer
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
		const sources = this.proposedEdge.sources;
		if (sources.length === 0)
			return;
		
		const spans = sources.filter((src): src is X.Span => src instanceof X.Span);
		const identifiers = spans
			.map(f => f.boundary.subject)
			.filter((sub): sub is X.Identifier => sub instanceof X.Identifier);
		
		const identifiersList = identifiers.filter(id => id.isList);
		const identifiersNonList = identifiers.filter(id => !id.isList);
		
		if (identifiersList.length > 0 && identifiersNonList.length > 0)
			for (const span of spans)
				this.addFault(span, X.Faults.ListAnnotationConflict);
	}
	
	/** */
	detectCircularReferences()
	{
		const circularEdgePaths: X.HyperEdge[][] = [];
		const recurse = (
			srcBase: X.SpecifiedParallel,
			path: X.HyperEdge[]) =>
		{
			const bases = Array.from(this.basesOf(srcBase));
			
			for (const { base, edge } of this.basesOf(srcBase))
			{
				if (path.includes(edge))
					circularEdgePaths.push(path.slice());
				else
					recurse(base, path.concat(edge));
			}
		}
		
		for (const { base, edge } of this.basesOf(this.targetParallel))
			recurse(base, []);
		
		for (const item of circularEdgePaths)
			for (const circularEdge of item)
				this.addFault(circularEdge, X.Faults.CircularTypeReference);
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
