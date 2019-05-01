import * as X from "../../X";


/**
 * 
 */
export class Contract
{
	/** */
	constructor(sourceParallel: X.SpecifiedParallel)
	{
		const recurse = (srcParallel: X.Parallel) =>
		{
			if (srcParallel instanceof X.UnspecifiedParallel)
			{
				for (const nestedParallel of srcParallel.getParallels())
					recurse(nestedParallel);
			}
			else if (srcParallel instanceof X.SpecifiedParallel)
			{
				for (const { base } of srcParallel.eachBase())
					this._unsatisfiedConditions.add(base);
			}
		};
		
		for (const higherParallel of sourceParallel.getParallels())
			recurse(higherParallel);
		
		this.allConditions = Object.freeze(Array.from(this._unsatisfiedConditions));
	}
	
	/**
	 * Computes whether the input SpecifiedParallel is a more derived
	 * type of the SpecifiedParallel that corresponds to this Contract.
	 * 
	 * @returns A number that indicates the number of conditions that
	 * were satisfied as a result of adding the provided SpecifiedParallel
	 * to the Contract.
	 */
	trySatisfyCondition(foreignParallel: X.SpecifiedParallel)
	{
		if (this.allConditions.length === 0)
			return 0;
		
		const foreignParallelBases = new Set<X.SpecifiedParallel>();
		let satisfied = 0;
		
		const addForeignParallelBases = (srcParallel: X.SpecifiedParallel) =>
		{
			for (const { base } of srcParallel.eachBase())
				addForeignParallelBases(base);
			
			foreignParallelBases.add(srcParallel);
		};
		
		for (const { base } of foreignParallel.eachBase())
			addForeignParallelBases(base);
		
		for (const foreignBase of foreignParallelBases)
			for (const condition of this.allConditions)
				if (foreignBase === condition)
					satisfied += this._unsatisfiedConditions.delete(condition) ? 1 : 0;
		
		return satisfied;
	}
	
	/** */
	get hasConditions()
	{
		return this.allConditions.length > 0;
	}
	
	/** */
	get unsatisfiedConditions(): ReadonlySet<X.SpecifiedParallel>
	{
		return this._unsatisfiedConditions;
	}
	private readonly _unsatisfiedConditions = new Set<X.SpecifiedParallel>();
	
	/**
	 * Stores an array containing the parallels that any supplied
	 * parallel must have in it's base graph in order to be deemed
	 * compliant.
	 */
	private readonly allConditions: ReadonlyArray<X.SpecifiedParallel>;
}
