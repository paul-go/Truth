import { Type } from "../../../Truth/Core/X";
import CodeJSON from "./Code";

//Self explaining types
export type TypeId = number;
export type Alias = string;

export type Typeish = TypeId | PrimeType | Type;

/**
 * Lazy and serializable representation of type 
 */
export default class PrimeType 
{
	static fromType(code: CodeJSON, type: Type)
	{
		return 1;
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
	
	addBase(type: Typeish)
	{
		this.bases.add(PrimeType.typeId(this.code, type));
	}
	
	addContent(type: Typeish)
	{
		this.content.add(PrimeType.typeId(this.code, type));
	}
	
	addAlias(alias: string)
	{
		this.aliases.add(alias);
	}
	
	bases = new Set<TypeId>();
	content = new Set<TypeId>();
	aliases = new Set<Alias>();
}