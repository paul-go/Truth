import PrimeType from "./Type";
import { Type, read } from "../../../Truth/Core/X";
import { promises as FS } from "fs";
import Serializer from "./Serializer";
import { typeHash, JSONRec } from "./Util";
import { FuturePrimeType } from "./FutureType";
 
/**
 * Builds and emits Code JSON file
 */
export default class CodeJSON 
{
	protected types: PrimeType[] = [];
	
	primeId(type: PrimeType)
	{
		return this.types.indexOf(type);
	}	
	
	add(prime: PrimeType)
	{
		const id = this.types.push(prime) - 1;
		FuturePrimeType.set(id, prime);
		return prime;
	}
	
	/**
	 * 
	 */
	async loadFile(path: string)
	{
		try 
		{
			const file = await FS.readFile(path, "utf-8");
			if (file.trim().length === 0) 
				return;
			const json = JSON.parse(file);
			const array = json.map((x: [number] & any[]) => Serializer.decode(x, PrimeType.JSONLength));
			const primes: PrimeType[] = [];
			for (const data of array)
			{
				const prime = PrimeType.fromJSON(this, data);
				this.add(prime);
				primes.push(prime);
			}
			
			for (const prime of primes)
				prime.link();
		} 
		catch (ex) {
			console.error(`Couldn't load ${path}! Reason: ${ex}`);	
		}
	}
	
	constructor(private pattern: RegExp) {}

	async loadTruth(path: string)
	{	
		const Doc = await read(path);
		 
		if (Doc instanceof Error)
			return console.error(`Couldn't load truth file ${path}! Reason: ${Doc.message}`);
			
		const primes: PrimeType[] = [];
			
		const scanContent = (type: Type) =>
		{
		
			if (!PrimeType.SignatureMap.has(typeHash(type)))
			{
				const prime = PrimeType.fromType(this, type);
				this.add(prime);
				primes.push(prime);
			}
			 
			type.contents.forEach(x => scanContent(x));
		}	
		
		Doc.program.verify();
		
		for (const fault of Doc.program.faults.each())
			console.error(fault.toString());
		
		Doc.types.forEach(x => scanContent(x));
		
		
		for (const prime of primes)
			prime.link();
	}
	
	extractData()
	{
		const dataRoots = this.types.filter(x => x.container.id === -1 && this.pattern.test(x.name));
		const drill = (x: PrimeType) => {
			const array = [x];
			const children = Array.from(x.contents.values()).map(x => x.prime).flatMap(drill);
			if (children.length) array.push(...children);
			return array;
		};
		const dataSchema = dataRoots.map(drill).filter(x => Array.isArray(x) ? x.length : true);
		const dataQuery = dataSchema.flat();
		const codeRoots = this.types.filter(x => !dataQuery.includes(x));
		
		const code = new CodeJSON(this.pattern);
		for (const prime of codeRoots)
			code.add(prime);
			
		const dataPatterns: PrimeType[] = [];
		dataQuery.map(x => x.compile("")).forEach(x => {
			if (!dataPatterns.some(x => x.typeSignature)) 
				dataPatterns.push(x);
		});
	
		for (const prime of codeRoots)
			code.add(prime);
		
	}
	
	/**
	 * 
	 */
	toJSON()
	{
		this.extractData();
		return this.types;
	}
}
