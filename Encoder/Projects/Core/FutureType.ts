import { Type } from "../../../Truth/Core/X";
import PrimeType, { TypeId, Typeish } from "./Type";

export class FuturePrimeType
{
	static typeMap = new Map<Type, PrimeType>();
	static reverseTypeMap = new Map<PrimeType, Type>();
	static idMap = new Map<TypeId, PrimeType>();
	static futureMap = new Map<Typeish, FuturePrimeType>();
	
	static $(value: Typeish)
	{
		if (this.futureMap.has(value))
			return this.futureMap.get(value);
		
		const future = new FuturePrimeType(value);
		this.futureMap.set(value, future);
		return future;
	}
	
	constructor(public value: Typeish) {}
	
	static set(value: Type | TypeId, prime: PrimeType)
	{
		if (value instanceof Type)
		{
			this.typeMap.set(value, prime);
			this.reverseTypeMap.set(prime, value);
		}
		else 
		{
			this.idMap.set(value, prime);
		}
	}
	
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
		let id;
		if (this.value instanceof PrimeType) 
			id = this.value.id;
		else if (this.value instanceof Type)
			id = FuturePrimeType.typeMap.get(this.value).id;
		else
			id = this.value;
			
		return id ? id : -1;
	}
	
	valueOf()
	{
		return this.id;
	}
	
	toJSON()
	{
		return this.id;
	}
}