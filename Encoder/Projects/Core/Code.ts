import PrimeType from "./Type";
import { Type } from "../../../Truth/Core/X";
import Scanner from "./Scanner";
 
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
		try 
		{
			return new CodeJSON(scanner);
		} 
		catch (ex) 
		{
			return new CodeJSON(scanner);
		}
	}
	
	types: PrimeType[] = [];
	map: Map<number, PrimeType> = new Map();	

	/**
	 * 
	 */
	constructor(scanner: Scanner)
	{
		scanner.codeList.forEach(x => this.typeId(x));
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
