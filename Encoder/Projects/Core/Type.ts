import { Type } from "../../../Truth/Core/X";
import CodeJSON from "./Code";
import Flags from "./Flags";
import { HashHash } from "./Util";

//Self explaining types
export type TypeId = number;
export type Alias = string;

export type Typeish = TypeId | PrimeType | Type;

/**
 * Lazy and serializable representation of Type 
 */
export default class PrimeType 
{	
	static FlagFields = [
		"Anonymous", 
		"Fresh",
		"List",
		"ListIntrinsic",
		"ListExtrinsic",
		"Pattern",
		"Uri", 
		"Specified",
	];
	
	static fromType(code: CodeJSON, type: Type)
	{
		const prime = new PrimeType(code);
		prime.name = type.name;
		
		for (const key of PrimeType.FlagFields)
			prime.flags.setFlag(key, type["is" + key]);
			
		for (const base of type.bases)
			prime.bases.add(PrimeType.fromType(code, base).id);
			
		for(const parallel of type.parallels)
			prime.parallels.add(PrimeType.fromType(code, parallel).id);
			
		const hash = prime.hash;
		if (!code.map.has(hash))
		{
			code.types.push(prime);
			code.map.set(hash, prime);
		}
		else 
		{
			return code.map.get(hash);
		}
			
		return prime;
	}
	
	static typeId(code: CodeJSON, item: Typeish)
	{
		return item instanceof Type 
			? PrimeType.fromType(code, item) 
			: item instanceof PrimeType
			? item.id
			: item; 
	}
	
	/**
	 * Stores a text representation of the name of the type,
	 * or a serialized version of the pattern content in the
	 * case when the type is actually a pattern.
	 */
	name: string = "";
	
	/**
	 * 
	 */
	flags = new Flags(PrimeType.FlagFields);
	
	/**
	 * Stores the array of types from which this type extends.
	 * If this Type extends from a pattern, it is included in this
	 * array.
	 */
	bases = new PrimeTypeSet(this.code);
	
	/**
	 * Stores the array of types that are contained directly by this
	 * one. In the case when this type is a list type, this array does
	 * not include the list's intrinsic types.
	 */
	contents = new PrimeTypeSet(this.code);
	
	/**
	 * Gets an array that contains the raw string values representing
	 * the type aliases with which this type has been annotated.
	 * 
	 * If this type is unspecified, the parallel graph is searched,
	 * and any applicable type aliases will be present in the returned
	 * array.
	 */
	aliases = new Set<Alias>();
	
	/**
	 * Stores a reference to the type, as it's defined in it's next most applicable type.
	 */
	parallels = new PrimeTypeSet(this.code);
	
	/**
	 *
	 */
	constructor(protected code: CodeJSON)
	{
		
	}
	
	/**
	 * Summary of this type object
	 */
	get signature()
	{
		return `${this.name},${this.flags}%${this.bases}%${this.parallels}`;
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
		return this.code.types.indexOf(this);
	}
	
	/**
	 * 
	 */
	toJSON()
	{	
		return [
			this.name, this.flags, this.bases, this.parallels
		];
	}
}

export class PrimeTypeSet extends Set<TypeId>
{
	get signature()
	{
		return this.toJSON().join(',');
	}
	
	toString()
	{
		return this.signature;
	}
	
	constructor(private code: CodeJSON) 
	{
		super();
	}
	
	toJSON()
	{
		return Array.from(this.values()).sort();
	}
}