import PrimeType from "./Type";
import { Type } from "../../../Truth/Core/X";
import Scanner from "./Scanner";
import { promises as FS } from "fs";
import Serializer from "./Serializer";
import { typeHash } from "./Util";
 
/**
 * Builds and emits Code JSON file
 */
export default class CodeJSON 
{
	/**
	 * 
	 */
	static async fromFile(path: string, scanner: Scanner)
	{
		const code = new CodeJSON(scanner);
		try 
		{
			const file = await FS.readFile(path, "utf-8");
			const json = JSON.parse(file);
			const array = json.map((x: [number] & any[]) => Serializer.decode(x, PrimeType.JSONLength));
			for (const data of array)
			{
				const prime = PrimeType.fromJSON(code, data);
				code.types.push(prime);
			}
		} 
		catch (ex) { }
		code.scan();
		return code;
	}
	
	cleanup()
	{
		let i = 0;
		while (i < this.types.length) 
		{
			const type = this.types[i];
			const hash = type.hash;
			console.log(type.name, hash);
			if (this.hashMap.has(hash))
			{
				const t1 = this.hashMap.get(hash).id;
				const t2 = this.types.splice(i, 1)[0].id;
				
				this.resolveMap.set(t2, t1);
			}
			else 
			{
				this.hashMap.set(hash, type);
				i++;
			}
		}
	}
	
	resolve(id: number)
	{
		return this.resolveMap.get(id) || id;
	}	
	
	types: PrimeType[] = [];
	resolveMap: Map<number, number> = new Map();
	hashMap: Map<number, PrimeType> = new Map();	
	
	/**
	 * @internal
	 */
	typeCache: Map<Type, PrimeType> = new Map();
	typeHashMap: Map<number, Type> = new Map();
	
	uniqueType(type: Type)
	{
		const hash = typeHash(type);
		const t1 = this.typeHashMap.get(hash);
		
		if (t1) 
			return t1;
		else 
		{
			this.typeHashMap.set(hash, type);
			return type;
		}
	}

	/**
	 * 
	 */
	constructor(protected scanner: Scanner)
	{
	}
	
	scan()
	{
		this.scanner.codeList.forEach(x => this.typeId(x));
	}
	
	/**
	 * 
	 */
	typeId(type: Type)
	{
		const prime = PrimeType.fromType(this, type);
		return this.types.indexOf(prime);
	}
	
	/**
	 * 
	 */
	toJSON()
	{
		this.cleanup();
		return this.types;
	}
}
