import * as X from "../../X";


/**
 * Encapulates functionality for cleaning up Parallel objects,
 * so that they can be safely referenced by others. The clean
 * up process involves trimming erroneous bases, and 
 * reporting any detected faults.
 */
export class ParallelSanitizer
{
	constructor(private readonly cruft: X.CruftCache) { }
	
	/** */
	sanitize(parallel: X.SpecifiedParallel)
	{
		// 
		// Detect circular references
		// 
		{
			const circularEdgePaths: X.HyperEdge[][] = [];
			const recurse = (
				srcBase: X.SpecifiedParallel,
				path: X.HyperEdge[]) =>
			{
				for (const { base, edge } of srcBase.eachBase())
				{
					if (path.includes(edge))
						circularEdgePaths.push(path.slice());
					else
						recurse(base, path.concat(edge));
				}
			}
			
			for (const { base, edge } of parallel.eachBase())
				recurse(base, [edge]);
			
			for (const item of circularEdgePaths)
				for (const circularEdge of item)
					this.cruft.add(circularEdge, X.Faults.CircularTypeReference);
		}
	}
}
