
namespace Encoder
{
	export class TypeSet extends Set<FutureType>
	{
		toArray()
		{
			return Array.from(this.values()).sort();	
		}
		
		toJSON() { return this.toArray(); }
		valueOf() { return this.toArray(); }
		[Symbol.toPrimitive]() { return this.toArray(); }
		get [Symbol.toStringTag]() { return "TypeSet"; }
	}
}