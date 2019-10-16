
namespace Backer
{
	export class TypeSet extends Set<FutureType>
	{
		static fromJSON(data: number[])
		{
			return new TypeSet(data.map(x => FutureType.$(x)));
		}
		
		toArray()
		{
			return Array.from(this.values()).sort();	
		}
	}
}