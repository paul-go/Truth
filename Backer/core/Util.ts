
namespace Backer.Util
{
	const Headers = `
any
object : any
string : any
number : any
bigint : any
boolean : any

/".+" : string
/(\\+|-)?(([1-9]\\d{0,17})|([1-8]\\d{18})|(9[01]\\d{17})) : number
/(0|([1-9][0-9]*)) : bigint
/(true|false) : boolean
	`;
	
	/**
	 * Hash calculation function adapted from:
	 * https://stackoverflow.com/a/52171480/133737
	 */
	export function hash(value: string, seed = 0)
	{
		let h1 = 0xDEADBEEF ^ seed;
		let h2 = 0X41C6CE57 ^ seed;
		
		for (let i = 0; i < value.length; i++)
		{
			let ch = value.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		
		h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
		h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
		return 4294967296 * (2097151 & h2) + (h1 >>> 0);
	}
	
	/**
	 * Compress nested arrays
	 * @param data An array with nested arrays in it
	 */
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
	
	/**
	 * Decompress nested arrays
	 * @param data A compressed array
	 */
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
	
	/**
	 * Fetch a file without platform dependencies
	 * @param url JSON file url
	 */
	export async function fetchJSON(url: string)
	{
		if (globalThis && "fetch" in globalThis) 
		{
			const request = await (<any>globalThis).fetch(url);
			return await request.json();
		}
		
		throw "This platform is not supported!";
	}
	
	/**
	 * Make a property (non-)enumerable
	 */
	export function shadow(object: object, key: string | symbol, enumerable = false)
	{
		Object.defineProperty(object, key, {
			enumerable
		});
	}
	
	/**
	 * Make a properties (non-)enumerable
	 */
	export function shadows(object: object, enumerable = false, ...keys: Array<string | symbol>)
	{
		for (let key of keys)
			shadow(object, key, enumerable);
	}
	
	/**
	 * 
	 */
	export async function loadFile(content: string, pattern: RegExp)
	{
		const doc = await Truth.parse(Headers + content);
		
		if (doc instanceof Error)
			throw doc;
		
		doc.program.verify();
		const faults = Array.from(doc.program.faults.each());
		
		if (faults.length) 
		{			
			for (const fault of faults)
				console.error(fault.toString());
			
			throw faults[0].toString();
		}
		
		let code = new Code();
		
		const drill = (type: Truth.Type) => 
		{
			code.add(Type.new(code, type));
			
			for (const sub of type.contents)
				drill(sub);
		};
		
		for (const type of doc.types)
			drill(type);
		
		const extracted = code.extractData(pattern);
		return extracted.code;
	}
}
