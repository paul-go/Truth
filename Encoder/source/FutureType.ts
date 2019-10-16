
namespace Encoder 
{
	export type Typeish = Truth.Type | Type | number;
	
	export class FutureType
	{
		static Cache = new Map<Typeish, FutureType>();
		static TypeMap = new Map<Truth.Type, Type>();
		static IdMap = new Map<number, Type>();
		
		static $(value: Typeish)
		{
			const cached = FutureType.Cache.get(value);
			
			if (cached)
				return cached;
				
			const instance = new FutureType(value);
			FutureType.Cache.set(value, instance);
			
			return instance;
		} 
		
		constructor(private value: Typeish) { }
		 
		get type()
		{
			if (this.value instanceof Truth.Type)
			{
				const type = FutureType.TypeMap.get(this.value);
				if (!type) 
					return null;
				return type;
			}
			
			if (this.value instanceof Type)
				return this.value;
				
			return FutureType.IdMap.get(this.value) || null;
		}
		
		get id()
		{
			if (this.value instanceof Truth.Type)
			{
				const type = FutureType.TypeMap.get(this.value);
				if (!type) 
					return -1;
				return type.id;
			}
			
			if (this.value instanceof Type)
				return this.value.id;
				
			return this.value;
		}
		
		is(type: Type)
		{
			const valueType = this.value;
			if (!valueType) return false;
			return valueType === type;	
		}
		
		toJSON() { return this.id; }
		valueOf() { return this.id; }
		[Symbol.toPrimitive]() { return this.id; }
		get [Symbol.toStringTag]() { return "FutureType"; }
	}
}