
namespace Truth
{
	/**
	 * @internal
	 * A minimal abstraction of a JavaScript array, but where the indexes
	 * are treated as 1-based.
	 */
	export class Array1Based<T>
	{
		/**
		 * Yields items starting at the specified position, and continues forward
		 * until the end of the array is reached.
		 */
		*enumerateForward(from = 1)
		{
			const len = this.items.length;
			for (let idx = this.toZeroBased(from); idx < len; idx++)
				yield this.items[idx];
		}
		
		/**
		 * Yields items starting at the specified position, and continues backward
		 * until the start of the array is reached.
		 */
		*enumerateBackward(from = -1)
		{
			for (let idx = this.toZeroBased(from); idx >= 0; idx--)
				yield this.items[idx];
		}
		
		/**
		 * Get the length of the array.
		 */
		get length()
		{
			return this.items.length;
		}
		
		/**
		 * Returns the item at the specified position.
		 * If the specified position is less than 0, the position
		 * is assumed to be relative to the end of the array.
		 */
		get(pos: number)
		{
			return this.items[this.toZeroBased(pos)];
		}
		
		/**
		 * 
		 */
		set(pos: number, item: T)
		{
			this.items[this.toZeroBased(pos)] = item;
		}
		
		/**
		 * Returns a 1-based position of the specified item.
		 * Returns -1 in the case when the item was not found in the array.
		 */
		posOf(item: T)
		{
			const idx = this.items.indexOf(item);
			return idx < 0 ? -1 : idx + 1;
		}
		
		/**
		 * Adds an item to the array.
		 */
		push(item: T)
		{
			return this.items.push(item);
		}
		
		/**
		 * Performs a standard Array.splice() call on the array.
		 */
		splice(pos: number, deleteCount: number, ...items: T[])
		{
			if (pos >= this.items.length)
			{
				if (deleteCount > 0)
				{
					const deleted = this.items.slice(-deleteCount);
					this.items.length -= deleteCount;
					this.items.push(...items);
					return deleted;
				}
				
				this.items.push(...items);
				return [];
			}
			
			return this.items.splice(pos - 1, deleteCount, ...items);
		}
		
		/**
		 * Converts a 1-based position into a bounded 0-based index.
		 */
		private toZeroBased(pos: number)
		{
			if (pos === 0)
				throw Exception.invalidArgument();
			
			const len = this.items.length;
			pos--;
			
			if (pos < 0)
				return Math.max(0, len - pos);
			
			if (pos > len)
				return len - 1;
			
			return pos;
		}
		
		/** */
		private readonly items: T[] = [];
	}
}
