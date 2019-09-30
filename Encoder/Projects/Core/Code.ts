import PrimeType from "./Type";
import { Type, read } from "../../../Truth/Core/X";
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
	constructor(protected types: PrimeType[] = []) {	}
	
	primeId(type: PrimeType)
	{
		return this.types.indexOf(type);
	}	
	
	/**
	 * 
	 */
	async loadFile(path: string)
	{
		try 
		{
			const file = await FS.readFile(path, "utf-8");
			if (file.trim().length === 0) return;
			const json = JSON.parse(file);
			const array = json.map((x: [number] & any[]) => Serializer.decode(x, PrimeType.JSONLength));
			for (const data of array)
			{
				const prime = PrimeType.fromJSON(this, data);
				this.types.push(prime);
			}
		} 
		catch (ex) {
			console.error(`Couldn't load ${path}! Reason: ${ex}`);	
		}
	}

	async loadTruth(path: string)
	{	
		const Doc = await read(path);
		
		if (Doc instanceof Error)
			return console.error(`Couldn't load truth file ${path}! Reason: ${Doc.message}`);
			
		const scanContent = (type: Type) =>
		{
			if (!PrimeType.SignatureMap.has(typeHash(type)))
				this.types.push(PrimeType.fromType(this, type));
			type.contents.forEach(x => scanContent(x));
		}	
		
		Doc.program.verify();
		
		for (const fault of Doc.program.faults.each())
			console.error(fault.toString());
		
		Doc.types.forEach(x => scanContent(x));
	}	
	
	/**
	 * 
	 */
	toJSON()
	{
		return this.types;
	}
}
