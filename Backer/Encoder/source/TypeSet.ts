
namespace Backer
{
	export class TypeSet extends Set<FutureType>
	{
		static fromJSON(data: number[])
		{
			return new TypeSet(data.map(x => FutureType.$(x)));
		}
		
		snapshot()
		{
			return this.toArray().map(x => x.type).filter(x => x) as Type[];
		}
		
		toArray()
		{
			return Array.from(this.values()).sort();	
		}
	}
}