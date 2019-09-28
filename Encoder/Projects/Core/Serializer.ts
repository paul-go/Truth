import { Bitfield } from "./Flags";

export default class Serializer 
{
	constructor()
	{	
	}
	
	static encode(data: any[])
	{
		const Bitfields = new Bitfield();
		const result = [];
		for (let i = -1; ++i < data.length;)
		{
			const value = typeof data[i] === "object" && "toJSON" in data[i] ? data[i].toJSON() : data[i];	
			const bit = Array.isArray(value) && value.length === 0;
			Bitfields.set(i, bit ? false : true);
			if (!bit) result.push(value);
		}
		result.unshift(Bitfields);
		return result;
	}
	
	static decode(data: [number] & any[], length?: number)
	{
		const Bitfields = new Bitfield(data.shift());
		if (!length || length < 1) length = Bitfields.size;
		const result = new Array(length);
		for (let i = -1; ++i < length;)
		{
			const bit = Bitfields.get(i);
			if (bit)
			{
				result[i] = data.shift();
			}
			else 
			{
				result[i] = [];
			}
		}
		return result;
	}
	
}