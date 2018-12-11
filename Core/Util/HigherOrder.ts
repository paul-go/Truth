
/**
 * A class that provides various higher-order functions
 * across data structures.
 */
export abstract class HigherOrder
{
	/**
	 * @returns The specified array.
	 * @throws An exception in the case when the array contains
	 * null or undefined items.
	 */
	static throwOnNullable<T>(array: Array<T>): Array<NonNullable<T>>
	{
		for (const item of array)
			if (item === null || item === undefined)
				throw new TypeError();
		
		return <Array<NonNullable<T>>>array;
	}
	
	/**
	 * @returns The specified array, but with null and undefined
	 * items removed.
	 */
	static filterNullable<T>(array: Array<T>): Array<NonNullable<T>>
	{
		return <Array<NonNullable<T>>>array.filter(item => item == null);
	}
	
	/**
	 * 
	 */
	static subtractMap<K, V>(positive: Map<K, V>, negative: Map<K, V>)
	{
		for (const key of negative.keys())
			positive.delete(key);
	}
	
	/**
	 * 
	 */
	static applySymmetricDifference<K, V>(left: Map<K, V>, right: Map<K, V>)
	{
		for (const key of right.keys())
		{
			if (left.has(key))
			{
				left.delete(key);
				right.delete(key);
			}
		}
	}
	
	/**
	 * Prunes elements from the specified array
	 * that match the specified predicate.
	 */
	static prune<T>(array: Array<T>, predicate: (item: T, index: number) => boolean)
	{
		const dirtyIndexes: number[] = [];
		
		for (let i = -1; ++i < array.length;)
			if (predicate(array[i], i))
				dirtyIndexes.unshift(i);
		
		for (let i = -1; ++i < dirtyIndexes.length;)
			array.splice(i, 1);
		
		return array;
	}
	
	/**
	 * @returns A readonly copy of the specified array, set, or list.
	 */
	static copy<T>(array: ReadonlyArray<T>): ReadonlyArray<T>;
	static copy<T>(set: ReadonlySet<T>): ReadonlySet<T>;
	static copy<K, V>(map: ReadonlyMap<K, V>): ReadonlyMap<K, V>;
	static copy(param: object): object
	{
		if (param instanceof Array)
			return Object.freeze(param.slice());
		
		if (param instanceof Set)
		{
			const set = new Set();
			
			for (const value of param)
				set.add(value);
			
			return Object.freeze(set);
		}
		
		if (param instanceof Map)
		{
			const map = new Map();
			
			for (const [key, value] of param)
				map.set(key, value);
			
			return Object.freeze(map);
		}
		
		throw new TypeError();
	}
	
	/** */
	static map<T, R>(set: ReadonlySet<T>, fn: (item: T) => R): Set<R>
	{
		const out = new Set<R>();
		
		for (const value of set.values())
			out.add(fn(value));
		
		return out;
	}
	
	/** */
	static distinct<T>(array: Array<T>)
	{
		return Object.freeze(Array.from(new Set(array)));
	}
	
	private constructor() { }
}
