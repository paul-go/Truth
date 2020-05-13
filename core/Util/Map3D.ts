
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
		get(key1: TKey1): readonly TVal[];
		get(key1: TKey1, key2: TKey2): TVal | undefined;
		get(key1: TKey1, key2?: TKey2)
		{
			return key2 === undefined ?
				// TODO: We shouldn't be creating a new array here every time this is
				// returned. Instead, this should be cached as an array within the system.
				Array.from(this.map.get(key1)?.values() || []) as readonly TVal[] :
				this.map.get(key1)?.get(key2);
		}
		
		/** */
		keys(): IterableIterator<TKey1>;
		keys(key1: TKey1): IterableIterator<TKey2>;
		keys(key1?: TKey1)
		{
			if (key1 === undefined)
				return this.map.keys();
			
			const subMap = this.map.get(key1);
			if (subMap)
				return subMap.keys();
			
			return [];
		}
		
		/** */
		private readonly map = new Map<TKey1, Map<TKey2, TVal>>();
	}
}
