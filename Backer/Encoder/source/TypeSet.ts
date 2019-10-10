
namespace Backer
{
	export class TypeSet extends Set<FutureType>
	{
		toArray()
		{
			return Array.from(this.values()).sort();	
		}
	}
}