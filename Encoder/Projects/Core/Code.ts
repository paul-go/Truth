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
	
	/**
	 * 
	 */
	constructor(scanner: Scanner)
	{
		scanner.codeList.forEach(x => this.addType(x));
	}
	
	addType(type: Type)
	{
		return PrimeType.fromType(this, type);
	}
	
	toJSON()
	{
		return this.types;
	}
}
