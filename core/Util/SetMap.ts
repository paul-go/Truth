

namespace Truth
{
	/**
	 * @internal
	 * A Map whose key is of the generic key type,
	 * and whose value is a Set of the generic item type.
	 */
	export class SetMap<TKey, TItem>
	{
		/** */
		*[Symbol.iterator]()
		{
			for (const entry of this.map)
				yield entry;
		}
		
		/** */
		entries()
		{
			return this.map.entries();
		}
		
		/** */
		get(key: TKey)
		{
			return this.map.get(key);
		}
		
		/** */
		has(key: TKey, item?: TItem)
		{
			const items = this.get(key);
			if (!items)
				return false;
			
			if (item !== undefined)
				return items.has(item);
			
			return true;
		}
		
		/** */
		add(key: TKey, item: TItem)
		{
			if (item)
			{
				const values = this.get(key);
				values ?
					values.add(item) :
					this.map.set(key, new Set([item]));
			}
			
			return this;
		}
		
		/**
		 * Deletes the Set with the specified key from this SetMap.
		 */
		delete(key: TKey): boolean;
		/**
		 * Deletes the specified item in the Set that corresponds to
		 * the specified key.
		 */
		delete(key: TKey, item: TItem): boolean;
		delete(key: TKey, item?: TItem)
		{
			if (item === undefined)
				return !!this.map.delete(key);
			
			const setOfValues = this.map.get(key);
			if (setOfValues === undefined)
				return false;
			
			setOfValues.delete(item);
			
			if (setOfValues.size === 0)
				this.map.delete(key);
		}
		
		/** */
		clear()
		{
			this.map.clear();
		}
		
		/** */
		values()
		{
			return this.map.values();
		}
		
		/** */
		get size()
		{
			return this.map.size;
		}
		
		/** */
		private map = new Map<TKey, Set<TItem>>();
	}
}

