
namespace Encoder 
{
	export function safe<T>(func: (...args: any[]) => T, msg: string, stack = false): T
	{
		try 
		{
			return func();
		}
		catch (ex)
		{
			throw `${msg} ${stack ? ex.stack : ""}`;
		}
	}
	
	export function reduce(obj: any)
	{
		if (obj && typeof obj === "object" && "toJSON" in obj) 
			obj = obj.toJSON(); 
			
		if (!(typeof obj === "object" && obj !== null)) 
			return obj;
			
		const isArray = Array.isArray(obj);
		const res = isArray ? [] : {} as Record<string, any>;
			
		for (const key in obj)
		{
			let value = obj[key];
			value = value && typeof value === "object" && "toJSON" in value ? value.toJSON() : value;
			
			if (typeof value === "object") 
				value = reduce(value);
			
			if (isArray)
				res.push(value);
			else if (value !== null || value !== undefined) 
				res[key] = value;
		}
		return res;
	}	
	
	export function stringify(obj: any)
	{
		const data = reduce(obj);
		const json = require("util").inspect(data, {
			compact: true,
			breakLength: 100,
			maxArrayLength: null,
			depth: null
		});
		return json.replace(/"/g, "\\\"").replace(/'/g, '"').replace(/  /g, "\t");
	}
}