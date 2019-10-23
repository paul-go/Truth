
namespace Backer.TruthTalk.Util
{
	export function filter(obj: any, predicate: (value: any, key: string, obj: any) => boolean)
	{
		const result: Record<string, any> = {};
		
		for (const key in obj)
			if (predicate(obj[key], key, obj))
				result[key] = obj[key];
				
		return result;		
	}
}