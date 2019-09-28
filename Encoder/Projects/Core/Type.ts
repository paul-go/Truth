import { Type } from "../../../Truth/Core/X";
import CodeJSON from "./Code";
import Flags from "./Flags";
import { HashHash } from "./Util";
import { PrimeTypeSet } from "./TypeSet";
import Serializer from "./Serializer";

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
	
	static TypeSetFields: Extract<keyof Type, keyof PrimeType>[] = [
		"bases",
		"parallels",
		"patterns",
		"contentsIntrinsic"
	];
	
	static JSONLength = 2 + PrimeType.TypeSetFields.length;
	
	/**
	 *
	 */
	static fromType(code: CodeJSON, type: Type)
	{
		type = code.uniqueType(type);
		
		if (code.typeCache.has(type))
			return code.typeCache.get(type);
			
		const prime = new PrimeType(code);
		
		code.types.push(prime);
		code.typeCache.set(type, prime);
		
		prime.name = type.name;
		
		for (const key of PrimeType.FlagFields)
			prime.flags.setFlag(key, type["is" + key]);
			
		for (const key of PrimeType.TypeSetFields)
			for (const subtype of (<Type[]>type[key]))
				(<PrimeTypeSet>prime[key]).add(PrimeType.fromType(code, subtype).id);
			
		return prime;
	}
	
	/**
	 *
	 */
	static fromJSON(code: CodeJSON, data: [string, number, TypeId[], TypeId[], TypeId[], TypeId[]])
	{
		const prime = new PrimeType(code);
		prime.name = data[0];	
		prime.flags.flags = data[1];
		data[2].forEach(x => prime.bases.add(x));
		data[3].forEach(x => prime.parallels.add(x));
		data[4].forEach(x => prime.patterns.add(x));
		data[5].forEach(x => prime.contentsIntrinsic.add(x));
		return prime;
	}
	
	/**
	 *
	 */
	static typeId(code: CodeJSON, item: Typeish)
	{
		return item instanceof Type 
			? PrimeType.fromType(code, item) 
			: item instanceof PrimeType
			? item.id
			: item; 
	}
	
	protected flags = new Flags(PrimeType.FlagFields);
	
	/**
	 * Stores a text representation of the name of the type,
	 * or a serialized version of the pattern content in the
	 * case when the type is actually a pattern.
	 */
	name: string = "";
	
	
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
	
	patterns = new PrimeTypeSet(this.code);
	
	derivations = new PrimeTypeSet(this.code);
	
	contentsIntrinsic = new PrimeTypeSet(this.code);
	
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
	 *
	 */
	get isAnonymous()
	{
		return this.flags.getFlag("Anonymous");
	}
	
	/**
	 *
	 */
	get isFresh()
	{
		return this.flags.getFlag("Fresh");
	}
	
	/**
	 *
	 */
	get isList()
	{
		return this.flags.getFlag("List");
	}
	
	/**
	 *
	 */
	get isListIntrinsic()
	{
		return this.flags.getFlag("ListIntrinsic");
	}
	
	/**
	 *
	 */
	get isListExtrinsic()
	{
		return this.flags.getFlag("ListExtrinsic");
	}
	
	/**
	 *
	 */
	get isPattern()
	{
		return this.flags.getFlag("Pattern");
	}
	
	/**
	 *
	 */
	get isUri()
	{
		return this.flags.getFlag("Uri");
	}
	
	/**
	 *
	 */
	get isSpecified()
	{
		return this.flags.getFlag("Specified");
	}
	
	/**
	 *
	 */
	get isOverride() 
	{ 
		return this.parallels.length > 0; 
	}
	
	/**
	 *
	 */
	get isIntroduction() 
	{ 
		return this.parallels.length === 0; 
	}
	
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
		return this.code.types.indexOf(this);
	}
	
	/**
	 * 
	 */
	toJSON()
	{	
		return Serializer.encode([
			this.name, this.flags, ...PrimeType.TypeSetFields.map(x => this[x])
		]);
	}
}
