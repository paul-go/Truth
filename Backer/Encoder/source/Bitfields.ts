
namespace Backer
{
	export class Bitfields
	{
		constructor(public flags = 0) {}
		
		get size()
		{
			return Math.ceil(Math.log2(this.flags));
		}
		
		get(index: number)
		{
			if (index < 0 || index > 31)
				return false;
				
			return this.flags & (1 << index) ? true : false;
		}
		
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
		
		toJSON() { return this.flags; }
		valueOf() { return this.flags; }
		[Symbol.toPrimitive]() { return this.flags; }
		get [Symbol.toStringTag]() { return "Bitfields"; }
	}
}