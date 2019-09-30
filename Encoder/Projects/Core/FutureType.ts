import { Type } from "../../../Truth/Core/X";
import PrimeType, { TypeId } from "./Type";

export class FuturePrimeType
{
	static typeMap = new Map<Type, PrimeType>();
	static reverseTypeMap = new Map<PrimeType, Type>();
	static idMap = new Map<TypeId, PrimeType>();
	
	constructor(public value: PrimeType | Type | TypeId) {}
	
	get prime()
	{
		if (this.value instanceof PrimeType) 
			return this.value;
		else if (this.value instanceof Type)
			return FuturePrimeType.typeMap.get(this.value);
		else
			return FuturePrimeType.idMap.get(this.value);
	}
	
	get type()
	{
		if (this.value instanceof Type) 
			return this.value;
		else if (this.value instanceof PrimeType)
			return FuturePrimeType.reverseTypeMap.get(this.value);
		else
			return FuturePrimeType.idMap.get(this.value);
	}
	
	get id()
	{
		if (this.value instanceof PrimeType) 
			return this.value.id;
		else if (this.value instanceof Type)
			return FuturePrimeType.typeMap.get(this.value).id;
		else
			return this.value;
	}
	
	valueOf()
	{
		return this.id;
	}
	
	toJSON()
	{
		const id = this.id;
		return id === null ? -1 : id;
	}
}