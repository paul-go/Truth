import { Type } from "../../../Truth/Core/X";
import CodeJSON from "./Code";
import Flags from "./Flags";

//Self explaining types
export type TypeId = number;
export type Alias = string;

export type Typeish = TypeId | PrimeType | Type;

/**
 * Lazy and serializable representation of type 
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
		const id = code.types.length - 1;
		const prime = new PrimeType(code, id);
		code.types.push(prime);
		prime.name = type.name;
		
		for (const key of PrimeType.FlagFields)
			prime.flags.setFlag(key, type["is" + key]);
			
		return id;
	}
	
	static typeId(code: CodeJSON, item: Typeish)
	{
		return item instanceof Type 
			? PrimeType.fromType(code, item) 
			: item instanceof PrimeType
			? item.id 
			: item; 
	}
	
	constructor(public code: CodeJSON, public id: TypeId)
	{
		
	}
	
	typeId(item: Typeish)
	{
		return PrimeType.typeId(this.code, item);
	}
	
	toJSON()
	{
		return {
			name: this.name,
			flags: this.flags
		}
	}
	
	name: string = "";
	flags = new Flags(PrimeType.FlagFields);
	
	bases = new Set<TypeId>();
	content = new Set<TypeId>();
	aliases = new Set<Alias>();
}