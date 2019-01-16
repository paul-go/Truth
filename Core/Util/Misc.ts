
export class Misc
{
	/**
	 * Counts incrementally through numbers, using the specified
	 * radix sequence. For example, if the radixes [2, 2, 2] were to
	 * be specified, this would result in binary counting starting at
	 * [0, 0, 0] and ending at [1, 1, 1].
	 */
	static *variableRadixCounter(radixes: number[])
	{
		if (radixes.length === 0)
			return;
		
		if (radixes.length === 1)
		{
			for (let i = -1; ++i < radixes[0];)
				yield [i];
			
			return;
		}
		
		const total = radixes.reduce((a, b) => a * b, 1);
		const digits = radixes.map(() => 0);
		const divideFactors = [1];
		
		for (let baseIdx = radixes.length - 1; --baseIdx >= 0;)
			divideFactors.unshift(radixes.slice(baseIdx + 1).reduce((a, b) => a * b, 1));
		
		for (let count = -1; ++count < total;)
		{
			const sequence: number[] = [];
			let remainder = count;
			
			for (let digitIdx = -1; ++digitIdx < digits.length;)
			{
				const div = divideFactors[digitIdx];
				sequence.push(remainder / div | 0);
				remainder %= div;
			}
			
			yield sequence;
		}
	}
	
	/**
	 * 
	 */
	static calculatePowerset<T>(array: T[]): T[][]
	{
		const result: T[][] = [[]];
				
		for (let i = 0; i < array.length; i++)
			for (let n = 0; n < result.length; n++)
				result.push(result[n].concat(array[i]));
		
		return result;
	}
	
	/**
	 * @returns Whether the items of the first set object form
	 * a subset (not a proper subset) of the items of the second
	 * set.
	 */
	static isSubset(sourceSet: ReadonlySet<any>, possibleSubset: ReadonlySet<any>)
	{
		for (const item of possibleSubset)
			if (!sourceSet.has(item))
				return false;
		
		return true;
	}
	
	/**
	 * @returns Whether the items of the first set object form
	 * a superset (not a proper superset) of the items of the
	 * second set.
	 */
	static isSuperset(sourceSet: ReadonlySet<any>, possibleSuperset: ReadonlySet<any>)
	{
		for (const item of sourceSet)
			if (!possibleSuperset.has(item))
				return false;
		
		return true;
	}
	
	private constructor() {}
}
