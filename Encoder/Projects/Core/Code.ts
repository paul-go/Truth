import PrimeType from "./Type";
import { Type } from "../../../Truth/Core/X";
import Scanner from "./Scanner";
import { promises as FS } from "fs";
import Serializer from "./Serializer";
 
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

	types: PrimeType[] = [];
	
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
		return this.types;
	}
}
