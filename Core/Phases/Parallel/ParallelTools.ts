import * as X from "../../X";


/**
 * 
 */
export class ParallelTools
{
	/** */
	static compare(
		a: X.Parallel | ReadonlyArray<X.Parallel>,
		b: X.Parallel | ReadonlyArray<X.Parallel>)
	{
		// This comparison is misguided because the function
		// we need is to be able to compare the parallel of the
		// source with the bases of the dest.
		
		const arrayA = a instanceof X.Parallel ? [a] : a;
		const arrayB = b instanceof X.Parallel ? [b] : b;
		
		if (arrayA.length + arrayB.length === 0)
			return ParallelComparisonResult.equal;
		
		if (arrayA.length === 0)
			return ParallelComparisonResult.subset;
		
		if (arrayB.length === 0)
			return ParallelComparisonResult.superset;
		
		const flatten = (pars: ReadonlyArray<X.Parallel>) =>
		{
			const queue = pars.slice();
			
			for (let queueIdx = -1; ++queueIdx < queue.length;)
			{
				const currentParallel = queue[queueIdx];
				
				if (currentParallel instanceof X.SpecifiedParallel)
					for (const base of currentParallel.getBases())
						if (!queue.includes(base))
							queue.push(base);
			}
			
			return queue;
		}
		
		const src = flatten(arrayA);
		const dst = flatten(arrayB);
		const numMissingFromSrc = dst.filter(val => !src.includes(val)).length;
		const numMissingFromDst = src.filter(val => !dst.includes(val)).length;
		
		if (numMissingFromSrc + numMissingFromDst === 0)
			return ParallelComparisonResult.equal;
		
		if (numMissingFromSrc === 0 && numMissingFromDst > 0)
			return ParallelComparisonResult.subset;
		
		if (numMissingFromSrc > 0 && numMissingFromDst === 0)
			return ParallelComparisonResult.superset;
		
		return ParallelComparisonResult.unequal;
	}
	
	/** */
	private constructor() { }
}


/**
 * 
 */
export enum ParallelComparisonResult
{
	subset,
	superset,
	equal,
	unequal
}
