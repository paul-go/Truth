
namespace Truth
{
	/**
	 * @internal
	 * Stores unsorted general utility methods.
	 */
	export class Misc
	{
		/**
		 * Returns a value from the specified Map. In the case when the key
		 * has not been entered into the Map, it's added to the map via the
		 * the function that computes a fallback value.
		 */
		static get<K, V>(map: Map<K, V>, key: K, fallbackFn: () => V): V
		static get<K extends object, V>(map: WeakMap<K, V>, key: K, fallbackFn: () => V): V
		static get<K extends object, V>(map: WeakMap<K, V>, key: K, fallbackFn: () => V): V
		{
			const value = map.get(key);
			if (value !== void 0)
				return value;
			
			const fallbackValue = fallbackFn();
			map.set(key, fallbackValue);
			return fallbackValue;
		}
		
		/**
		 * Compresses the number sequence into a reasonably unique 53-bit hash number.
		 * The hash is commutative in that the sequences [1, 2, 3] and [3, 2, 1] should result
		 * in the same number.
		 */
		static hashCommutative(numbers: number[])
		{
			let mul = 1;
			let add = 0;
			
			for (let i = numbers.length; i-- > 0;)
			{
				const num = numbers[i];
				// 32 bits for the multiplying of numbers together
				mul = (mul *= num) % (2 ** 32);
				// 18 bits for the total of all the numbers
				add = (add += num) % (2 ** 18);
			}
			
			// 3 bits for the number of numbers
			const count = numbers.length % (2 ** 3);
			
			return (count << 50) | (add << 32) | mul;
		}
		
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
		static isSubset(
			sourceSet: ReadonlySet<unknown>,
			possibleSubset: ReadonlySet<unknown>)
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
		static isSuperset(
			sourceSet: ReadonlySet<unknown>,
			possibleSuperset: ReadonlySet<unknown>)
		{
			for (const item of sourceSet)
				if (!possibleSuperset.has(item))
					return false;
			
			return true;
		}
		
		/**
		 * @returns The number of items that are missing
		 * from the second set that exist in the first set.
		 */
		static computeSubsetFactor(
			a: readonly unknown[],
			b: readonly unknown[])
		{
			let count = 0;
			
			for (const item of a)
				count += b.includes(item) ? 0 : 1;
			
			return count;
		}
		
		/**
		 * Performs a recursive reduction operation on an initial object
		 * that represents some abstract node of a graph. The traversal
		 * algorithm used ensures all provided nodes are only visited
		 * once.
		 */
		static reduceRecursive<TRet, T>(
			initialObject: T,
			followFn: (from: T) => Iterable<T>,
			reduceFn: (current: T, nestedResults: readonly TRet[]) => TRet
		): TRet
		{
			const visited = new Set<T>();
			
			const recurse = (object: T) =>
			{
				visited.add(object);
				const reduceResult: TRet[] = [];
				
				for (const next of followFn(object))
					if (!visited.has(next))
						reduceResult.push(recurse(next));
				
				return reduceFn(object, Object.freeze(reduceResult));
			};
			
			return recurse(initialObject);
		}
		
		/**
		 * @returns A proxy of the specified object, whose members
		 * have been patched with the specified patch object.
		 */
		static patch<T extends object>(source: T, patch: Partial<T>)
		{
			type K = readonly (keyof T)[];
			const patchKeys = Object.freeze(Object.keys(patch)) as K;
			
			return new Proxy(source, {
				get(target: T, key: keyof T)
				{
					return patchKeys.includes(key) ?
						patch[key] :
						source[key];
				}
			});
		}
		
		/**
		 * Safely parses a JSON object, silencing any thrown parse exceptions.
		 */
		static tryParseJson(jsonText: string)
		{
			try
			{
				return JSON.parse(jsonText);
			}
			catch (e)
			{
				return null;
			}
		}
		
		private constructor() {}
	}
}
