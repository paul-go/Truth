import { Type } from "../../../Truth/Core/X";
import CodeJSON from "./Code";
import Flags from "./Flags";
import { HashHash, typeHash } from "./Util";
import { PrimeTypeSet } from "./TypeSet";
import Serializer from "./Serializer";
import { FuturePrimeType } from "./FutureType";

//Self explaining types
export type TypeId = number;
export type Alias = string;

export type Typeish = TypeId | PrimeType | Type;

export type ExtractKeys<T, Q> = {
  [P in keyof T]: T[P] extends Q  ? P : never
}[keyof T]; 

/**
 * Lazy and serializable representation of Type 
 */
export default class PrimeType 
{	
	static FlagFields: ExtractKeys<Type, boolean>[] = [
		"isAnonymous", 
		"isFresh",
		"isList",
		"isListIntrinsic",
		"isListExtrinsic",
		"isPattern",
		"isUri", 
		"isSpecified",
	];
	
	static TypeSetFields: ExtractKeys<Type, readonly Type[]>[] = [
		"bases",
		"parallels",
		"patterns",
		"contentsIntrinsic",
	];
	
	static JSONLength = 5 + PrimeType.TypeSetFields.length;
	static SignatureMap = new Map<number, PrimeType>();
	
	/**
	 *
	 */
	static fromType(code: CodeJSON, type: Type)
	{
		const sign = typeHash(type);
		
		if (this.SignatureMap.has(sign))
		{
			const p = this.SignatureMap.get(sign);
			FuturePrimeType.typeMap.set(type, p);
			FuturePrimeType.reverseTypeMap.set(p, type);
			return p;
		}
	
		const prime = new PrimeType(code);
		
		FuturePrimeType.typeMap.set(type, prime);
		FuturePrimeType.reverseTypeMap.set(prime, type);
		
		prime.name = type.name;
		prime.typeSignature = typeHash(type);
		
		PrimeType.SignatureMap.set(prime.typeSignature, prime);
		prime.container = new FuturePrimeType(type.container);
		
		for (const key of PrimeType.FlagFields)
			prime.flags.setFlag(key, type[key]);
			
		for (const key of PrimeType.TypeSetFields)
			for (const subtype of type[key])
				(<PrimeTypeSet>prime[key]).add(new FuturePrimeType(subtype));
				
		for (const alias of type.aliases)
			prime.aliases.push(alias);
			
		return prime;
	}
	
	/**
	 *
	 */
	static fromJSON(code: CodeJSON, data: [number, string, number, number, Alias[], TypeId[], TypeId[], TypeId[], TypeId[]])
	{ 
		const prime = new PrimeType(code);
		prime.typeSignature = data[0];
		prime.name = data[1];	
		prime.flags.flags = data[2];
		prime.container = new FuturePrimeType(data[3]);
		data[4].forEach(x => prime.aliases.push(x));
		data[5].forEach(x => prime.bases.add(new FuturePrimeType(x)));
		data[6].forEach(x => prime.parallels.add(new FuturePrimeType(x)));
		data[7].forEach(x => prime.patterns.add(new FuturePrimeType(x)));
		data[8].forEach(x => prime.contentsIntrinsic.add(new FuturePrimeType(x)));
		this.SignatureMap.set(data[0], prime);
		return prime;
	}
	
	flags = new Flags(PrimeType.FlagFields);
	
	name: string = "";
	
	typeSignature = 0;
	
	aliases: string[] = [];
	container: FuturePrimeType;
	bases = new PrimeTypeSet();
	contents = new PrimeTypeSet();
	patterns = new PrimeTypeSet();
	parallels = new PrimeTypeSet();
	derivations = new PrimeTypeSet();
	contentsIntrinsic = new PrimeTypeSet();
	
	/**
	 *
	 */
	constructor(protected code: CodeJSON) {	}
	
	
	/**
	 * Summary of this type object
	 */
	get signature()
	{
		return `${this.name}
			${this.flags.toJSON()}%${PrimeType.TypeSetFields.map(x => this[x].toString()).join("%")}`;
	}
	
	/**
	 * Hash of type signature
	 */
	get hash()
	{
		return HashHash(this.signature);
	}
	
	/**
	 * Index of prime type in Code JSON
	 */
	get id()
	{
		return this.code.primeId(this);
	}
	
	/**
	 * 
	 */
	toJSON()
	{	
		return Serializer.encode([
			this.typeSignature, this.name, this.flags, this.container, this.aliases,
			...PrimeType.TypeSetFields.map(x => this[x])
		]);
	}
}
