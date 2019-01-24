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
		private readonly worker: X.ConstructionWorker,
		private readonly cruft: X.CruftCache) { }
	
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
		
		// In this case, we only need to do a 
		// shallow check for circular inheritance.
		sanitizer.trimCircularReferences();
		if (sanitizer.foundCruft)
			return false;
		
		if (srcParallel.baseCount > 0)
		{
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
	
	/** */
	trimCircularReferences()
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
	*basesOf(par: X.SpecifiedParallel)
	{
		for (const { base, edge } of par.eachBase())
			yield { base, edge };
		
		if (this.targetParallel === par)
			yield { base: this.proposedBase, edge: this.proposedEdge };
	}
	
	/** Gets a boolean value that indicates whether a fault has been reported. */
	get foundCruft()
	{
		return this._foundCruft;
	}
	private _foundCruft = false;
	
	/** */
	private addFault(source: X.TCruft, relevantFaultType: X.FaultType)
	{
		this._foundCruft = true;
		this.cruft.add(source, relevantFaultType);
	}
}
