
namespace Truth
{
	/**
	 * @internal
	 */
	export class Map3D<TKey1, TKey2, TVal>
	{
		/** */
		*[Symbol.iterator](): IterableIterator<[TKey1, TKey2, TVal]>
		{
			for (const [key1, subMap] of this.map)
				for (const [key2, value] of subMap)
					yield [key1, key2, value];
		}
		
		/** */
		set(key1: TKey1, key2: TKey2, value: TVal)
		{
			const subMap = Misc.get(this.map, key1, () => new Map<TKey2, TVal>());
			subMap.set(key2, value);
			return this;
		}
		
		/** */
		has(key1: TKey1, key2: TKey2)
		{
			const subMap = this.map.get(key1);
			return subMap?.has(key2) || false;
		}
		
		/** */
		delete(key1: TKey1, key2: TKey2)
		{
			const subMap = this.map.get(key1);
			let result = false;
			
			if (subMap)
			{
				result = subMap.delete(key2);
				
				if (subMap.size === 0)
					this.map.delete(key1);
			}
			
			return result;
		}
		
		/** */
		get(key1: TKey1): TVal[];
		get(key1: TKey1, key2: TKey2): TVal | undefined;
		get(key1: TKey1, key2?: TKey2)
		{
			return key2 === undefined ?
				Array.from(this.map.get(key1)?.values() || []) :
				this.map.get(key1)?.get(key2);
		}
		
		/** */
		private readonly map = new Map<TKey1, Map<TKey2, TVal>>();
	}
}
