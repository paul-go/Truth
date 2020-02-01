
namespace Backer
{
	/**
	 * Bitwise flag manager
	 */
	export class Bitfields
	{
		constructor(private flags = 0)
		{
			
		}
		
		/**
		 * Returns approx. size based on last set bit.
		 */
		get size()
		{
			return Math.ceil(Math.log2(this.flags));
		}
		
		/**
		 * Gets a boolean from specified index.
		 */
		get(index: number)
		{
			if (index < 0 || index > 31)
				return false;
				
			return this.flags & (1 << index) ? true : false;
		}
		
		/**
		 * Sets a boolean to specified index.
		 */
		set(index: number, value: boolean)
		{
			if (index < 0 || index > 31)
				return;
			
			const mask = 1 << index;
			
			if (value)
				this.flags |= mask;
			else 
				this.flags &= ~mask;
		}
		
		/** */
		toJSON()
		{
			return this.flags;
		}
		
		/** */
		valueOf()
		{
			return this.flags;
		}
		
		/** */
		[Symbol.toPrimitive]()
		{
			return this.flags;
		}
		
		/** */
		get [Symbol.toStringTag]()
		{
			return "Bitfields";
		}
	}
}
