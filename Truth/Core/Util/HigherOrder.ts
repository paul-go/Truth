
/**
 * A class that provides various higher-order functions
 * across data structures.
 */
export abstract class HigherOrder
{
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
	
	private constructor() { }
}
