
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
		 * 
		 * @param from The 1-based index at which to begin enumerating.
		 * The value provided is bounded by the available indexes in the array.
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
		 * 
		 * @param from The 1-based index at which to begin enumerating.
		 * The value provided is bounded by the available indexes in the array.
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
		 * Negative numbers passed to the pos argument start the splice
		 * operation from the end of the array, in the same manner as the
		 * standard JavaScript operation.
		 */
		splice(pos: number, deleteCount: number, ...items: T[]): readonly T[]
		{
			// This method needs to perform some strange handling due to the
			// fact that the JavaScript Array.splice() method has bizarre handling
			// when dealing with negative positions (there's no way to start at the
			// very end of the array), and the fact that this method also needs to 
			// translate the position into a 1-based index. Ironically, the fact that
			// this class needs to translate indexes actually makes this .splice()
			// method work as one might expect the JavaScript Array.splice()
			// method to work. Below is a table of how the method translates
			// the "pos" argument:
			// 
			// (Input => Translated):
			// -2 => -1
			// -1 => Array.splice not used
			// 0 => Error
			// 1 => 0
			// 2 => 1
			
			if (pos < -1)
				pos++;
			
			else if (pos === -1)
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
			
			if (pos === 0)
				throw Exception.invalidArgument();
			
			if (pos > 0)
				pos--;
			
			return this.items.splice(pos, deleteCount, ...items);
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
			
			if (pos >= len)
				return len - 1;
			
			return pos;
		}
		
		/** */
		private readonly items: T[] = [];
	}
}
