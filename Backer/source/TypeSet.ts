
namespace Backer
{
	/**
	 * Keeps track of relations between types.
	 */
	export class TypeSet extends Set<FutureType>
	{
		static fromJSON(data: number[])
		{
			return new TypeSet(data.map(x => FutureType.new(x)));
		}
		
		snapshot()
		{
			return this.toArray().map(x => x.type).filter(x => x) as Type[];
		}
		
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