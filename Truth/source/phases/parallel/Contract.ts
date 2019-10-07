
namespace Truth
{
	/**
	 * 
	 */
	export class Contract
	{
		/** */
		constructor(sourceParallel: SpecifiedParallel)
		{
			const recurse = (srcParallel: Parallel) =>
			{
				if (srcParallel instanceof UnspecifiedParallel)
				{
					for (const nestedParallel of srcParallel.getParallels())
						recurse(nestedParallel);
				}
				else if (srcParallel instanceof SpecifiedParallel)
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
		trySatisfyCondition(foreignParallel: SpecifiedParallel)
		{
			if (this.allConditions.length === 0)
				return 0;
			
			const foreignParallelBases = new Set<SpecifiedParallel>();
			foreignParallelBases.add(foreignParallel);
			
			let satisfied = 0;
			
			const addForeignParallelBases = (srcParallel: SpecifiedParallel) =>
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
		get unsatisfiedConditions(): ReadonlySet<SpecifiedParallel>
		{
			return this._unsatisfiedConditions;
		}
		private readonly _unsatisfiedConditions = new Set<SpecifiedParallel>();
		
		/**
		 * Stores an array containing the parallels that any supplied
		 * parallel must have in it's base graph in order to be deemed
		 * compliant.
		 */
		private readonly allConditions: ReadonlyArray<SpecifiedParallel>;
	}
}
