
namespace Reflex.SS
{
	/**  */
	export const Util = new class
	{
		/** */
		isUpperCase(char: string)
		{
			const c = char.charCodeAt(0);
			return c > 64 && c < 91;
		};
		
		/** */
		isDigit(char: string)
		{
			const c = char.charCodeAt(0);
			return c > 47 && c < 58;
		}
		
		/**
		 * Enumerates through all the factored paths of the specified
		 * doubly-nested array.
		 * 
		 * For example, given an input such as: 
		 * [ [A, B], [C, D] ]
		 * 
		 * The enumerator will yield arrays in the sequence:
		 * [A, C] .. [A, D] .. [B, C] .. [B, D]
		 */
		factor<T>(array: T[][])
		{
			if (array.length === 0)
				return [];
			
			const total = array.reduce((a, b) => a * b.length, 1);
			const limits = [
				...array
					.slice(1)
					.map(array => array.length)
					.map((len, i, a) => a.slice(i).reduce((a, b) => a * b, 1)),
				1
			];
			
			const out: T[][] = [];
			for (let i = -1; ++i < total;)
			{
				const path = limits.map(() => 0);
				let rem = i;
				
				for (let n = -1; ++n < limits.length;)
				{
					const lim = limits[n];
					path[n] = (rem / lim) | 0;
					rem %= lim;
				}
								
				out.push(path.map((arrayIdx, pathIdx) => array[pathIdx][arrayIdx]));
			}
			
			return out;
		}
		
		/**
		 * Splits a compound selector into it's groups.
		 */
		splitSelector(selector: string)
		{
			const selectors: string[] = [];
			const at = {
				single: false,
				double: false,
				escape: false
			};
			
			let lastSlice = 0;
			
			for (let pos = -1; ++pos < selector.length;)
			{
				const char = selector[pos];
				
				if (at.escape)
					at.escape = false;
				
				else if (char === "'")
					at.single = !at.single;
				
				else if (char === '"')
					at.double = !at.double;
				
				else if (char === "\\")
					at.escape = true;
				
				else if (char === ",")
				{
					if (!at.single && !at.double && !at.escape)
					{
						selectors.push(selector.slice(lastSlice, pos));
						lastSlice = pos + 1;
					}
				}
			}
			
			return selectors
				.concat(selector.slice(lastSlice))
				.filter(s => s.trim());
		}
		
		/**
		 * Hash calculation function adapted from:
		 * https://stackoverflow.com/a/52171480/133737
		 */
		calculateHash(value: { toString(): string; }, seed = 0)
		{
			const val = value.toString();
			let h1 = 0xDEADBEEF ^ seed;
			let h2 = 0X41C6CE57 ^ seed;
			
			for (let i = 0; i < val.length; i++)
			{
				let ch = val.charCodeAt(i);
				h1 = Math.imul(h1 ^ ch, 2654435761);
				h2 = Math.imul(h2 ^ ch, 1597334677);
			}
			
			h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
			h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
			return 4294967296 * (2097151 & h2) + (h1 >>> 0);
		}
	}
}
