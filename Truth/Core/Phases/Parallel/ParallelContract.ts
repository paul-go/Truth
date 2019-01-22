import * as X from "../../X";


/**
 * 
 */
export class ParallelContract
{
	constructor(private readonly innerParallel: X.SpecifiedParallel) { }
	
	/**
	 * Computes whether the input SpecifiedParallel is a more derived
	 * type of the SpecifiedParallel that corresponds to this Contract.
	 */
	accepts(foreignParallel: X.SpecifiedParallel): IContractComparisonResult
	{
		const conditions = this.getConditions();
		if (conditions.length === 0)
			return {
				coveredBases: Object.freeze([]),
				isCovered: true
			};
		
		const coveredBases = new Set<X.SpecifiedParallel>();
		const foreignParallelBases = new Set<X.SpecifiedParallel>();
		
		if (conditions.length > 0)
		{
			function addForeignParallelBases(srcParallel: X.SpecifiedParallel)
			{
				for (const { base } of srcParallel.eachBase())
					addForeignParallelBases(base);
				
				foreignParallelBases.add(srcParallel);
			}
			
			for (const { base } of foreignParallel.eachBase())
				addForeignParallelBases(base);
			
			for (const foreignBase of foreignParallelBases)
				for (const condition of conditions)
					if (foreignBase === condition)
						coveredBases.add(condition);
		}
		
		return {
			coveredBases: Object.freeze(Array.from(coveredBases)),
			isCovered: coveredBases.size >= conditions.length
		};
	}
	
	/**
	 * Generates an array containing the parallels that any supplied
	 * parallel must have in it's base graph in order to be deemed
	 * compliant.
	 */
	private getConditions()
	{
		const conditions = new Set<X.SpecifiedParallel>();
		
		function recurse(srcParallel: X.Parallel)
		{
			if (srcParallel instanceof X.UnspecifiedParallel)
			{
				for (const nestedParallel of srcParallel.getParallels())
					recurse(nestedParallel);
			}
			else if (srcParallel instanceof X.SpecifiedParallel)
			{
				for (const { base } of srcParallel.eachBase())
					conditions.add(base);
			}
		}
		
		for (const higherParallel of this.innerParallel.getParallels())
			recurse(higherParallel);
		 
		return Array.from(conditions);
	}
}


/**
 * 
 */
export interface IContractComparisonResult
{
	readonly coveredBases: ReadonlyArray<X.SpecifiedParallel>,
	readonly isCovered: boolean;
}
