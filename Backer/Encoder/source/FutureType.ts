
namespace Backer 
{
	export type Typeish = Type | number;
	
	export class FutureType 
	{
		static Cache = new Map<Typeish, FutureType>();
		static IdMap = new Map<number, Type>();
		
		static $(value: Typeish)
		{
			const cached = FutureType.Cache.get(value);
			
			if (cached)
				return cached;
				
			const instance = new FutureType(value);
			this.Cache.set(value, instance);
			
			return instance;
		} 
		
		constructor(private value: Typeish) {}
		
		get type()
		{
			if (this.value instanceof Type)
				return this.value;
			
			return FutureType.IdMap.get(this.value) || null;
		}
		
		get id()
		{
			if (this.value instanceof Type)
				return this.value.id;
				
			return this.value;
		}
		
		
		toJSON() { return this.id; }
		valueOf() { return this.id; }
		[Symbol.toPrimitive]() { return this.id; }
		get [Symbol.toStringTag]() { return "FutureType"; }
	}
}