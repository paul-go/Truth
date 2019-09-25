import PrimeType from "./Type";
 
/**
 * Builds and emits Code JSON file
 */
export default class CodeJSON 
{
	/**
	 * 
	 */
	static async fromFile(path: string)
	{
		return new CodeJSON();
	}
	
	types: Set<PrimeType> = new Set();
	
	/**
	 * 
	 */
	constructor()
	{
		
	}
	
	
	
}
