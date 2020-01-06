
namespace Backer
{
	/**
	 * 
	 */
	export type Typeish = Truth.Type | Type | number;
	
	/**
	 * 
	 */
	export class FutureType
	{
		/** */
		static new(value: Typeish)
		{
			const cached = FutureType.cache.get(value);
			
			if (cached)
				return cached;
				
			const instance = new FutureType(value);
			FutureType.cache.set(value, instance);
			
			return instance;
		}
		
		/** */
		private static readonly cache = new Map<Typeish, FutureType>();
		
		/** */
		static readonly typeMap = new Map<Truth.Type, Type>();
		
		/** */
		static readonly idMap = new Map<number, Type>();
		
		/** */
		constructor(private readonly innerTypeish: Typeish) { }
		 
		 /** */
		get type()
		{
			if (this.innerTypeish instanceof Truth.Type)
			{
				const type = FutureType.typeMap.get(this.innerTypeish);
				if (!type) 
					return null;
				
				return type;
			}
			
			if (this.innerTypeish instanceof Type)
				return this.innerTypeish;
				
			return FutureType.idMap.get(this.innerTypeish) || null;
		}
		
		/** */
		get id()
		{
			if (this.innerTypeish instanceof Truth.Type)
			{
				const type = FutureType.typeMap.get(this.innerTypeish);
				return type ? type.id : -1;
			}
			
			if (this.innerTypeish instanceof Type)
				return this.innerTypeish.id;
				
			return this.innerTypeish;
		}
		
		/** */
		is(type: Type)
		{
			const valueType = this.innerTypeish;
			return valueType ?
				valueType === type :
				false;
		}
		
		/** */
		toJSON()
		{
			return this.id;
		}
		
		/** */
		valueOf()
		{
			return this.id;
		}
		
		/** */
		[Symbol.toPrimitive]()
		{
			return this.id;
		}
		
		/** */
		get [Symbol.toStringTag]()
		{
			return "FutureType";
		}
	}
}
