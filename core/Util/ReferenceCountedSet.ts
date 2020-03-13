
namespace Truth
{
	/**
	 * 
	 */
	export class ReferenceCountedSet<T>
	{
		/**
		 * 
		 */
		[Symbol.iterator]()
		{
			return this.map.keys();
		}
		
		/**
		 * 
		 */
		maybeAdd(item: T)
		{
			const existing = this.map.get(item);
			this.map.set(item, (existing || 0) + 1);
			return this;
		}
		
		/**
		 * 
		 */
		maybeDelete(item: T)
		{
			const existing = this.map.get(item);
			if (existing === 1)
				this.map.delete(item);
		}
		
		/**
		 * 
		 */
		has(item: T)
		{
			return this.map.has(item);
		}
		
		/** */
		private readonly map = new Map<T, number>();
	}
}
