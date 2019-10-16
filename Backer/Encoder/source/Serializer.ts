
namespace Backer.Serializer
{
	export function encode(data: any[])
	{
		const bf = new Bitfields();
		const result = [];
		
		for (let i = -1; ++i < data.length;)
		{
			const vp = data[i];
			const value = vp && typeof vp === "object" && "toJSON" in vp ? vp.toJSON() : vp;	
			const bit = Array.isArray(value) && value.length === 0;
			bf.set(i, bit ? false : true);
			 
			if (!bit) 
				result.push(value);
		}
		
		result.unshift(bf);
		return result;
	}
	
	export function decode(data: [number, ...any[]], length?: number)
	{
		const bf = new Bitfields(data.shift());
		
		if (!length || length < 1) 
			length = bf.size;
			
		const result = new Array(length);
		
		for (let i = -1; ++i < length;)
		{
			const bit = bf.get(i);
			if (bit)
				result[i] = data.shift();
			else 
				result[i] = [];
		}
		
		return result;
	}
}