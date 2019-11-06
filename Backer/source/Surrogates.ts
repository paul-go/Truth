/// <reference path="Nodes.ts"/>

namespace Backer
{
	export const typeOf = Symbol("typeOf");
	export const value = Symbol("value");
	export const values = Symbol("values");
	export const parent = Symbol("parent");
	
	export class Struct extends TruthTalk.Leaves.Surrogate
	{
		
		/**
		 * Generate a Struct/Surrogate from Backer.Type
		 */
		static new(type: Type, parentValue: Struct | Surrogate | null)
		{
			const constr = parentValue ? 
				parentValue instanceof Surrogate ?
				type.is(Schema.object[typeOf]) ? Surrogate :
				type.is(Schema.string[typeOf]) ? SurrogateString :
				type.is(Schema.number[typeOf]) ? SurrogateNumber :
				type.is(Schema.bigint[typeOf]) ? SurrogateBigInt :
				type.is(Schema.boolean[typeOf]) ? SurrogateBoolean :
				Surrogate : Struct : Struct;
				
			return new constr(type, parentValue);
		}
		
		readonly [typeOf]: Type;
		readonly [parent]: Struct | null;
		
		/** */
		get [values]()
		{
			return this[typeOf].aliases;
		}
		
		constructor(type: Type, parentValue: Struct | null)
		{
			super();
			this[typeOf] = type;
			this[parent] = parentValue;
			
			Util.shadows(this, false, typeOf, values, TruthTalk.op, parent, TruthTalk.container);
			
			for (const child of type.contents)
				(<any>this)[child.name] = Struct.new(child, this);
		}
		
		/**
		 * Typescript type adjustment 
		 */
		get proxy()
		{
			return this as unknown as Struct & Record<string, Struct>;
		}
		
		/** */
		get contents(): Struct[]
		{
			return Object.values(this);
		}
		
		/**
		 * Climb to root of this Struct
		 */
		get root()
		{
			let root: Struct | null = this;
			
			while (root && root[parent]) 
				root = root[parent];
			
			return root;
		}
		
		/** */
		instanceof(base: any)
		{
			return this[typeOf].is(base); 
		};
		
		/** */
		is(base: Type | Struct)
		{
			base = base instanceof Type ? base : base[typeOf];
			return this[typeOf].is(base);
		}
		
		/** */
		[Symbol.hasInstance](value: any)
		{
			return this.instanceof(value);
		}
		
		toJSON(){ return this[values]; }
		valueOf() { return this[values]; }
		toString() 
		{
			const val = this[values];
			if (val === null)
				return val;
			
			return String(val);
		}
		[Symbol.toPrimitive]() { return this[values]; }
		get [Symbol.toStringTag]() { return "Struct"; }
	}
	
	export class Surrogate<T = string> extends Struct
	{
		readonly [parent]: Surrogate | null;
		
		/** */
		get [value]() : T | null
		{
			return this[typeOf].value as T | null;
		}
		
		/** */
		get contents(): Surrogate[]
		{
			return Object.values(this);
		}
		
		/** */
		instanceof(base: any)
		{
			return this[value] instanceof base || this[typeOf].is(base); 
		};
		
		/** 
		 * Get nested property with matching Struct
		*/
		get(type: Struct): Surrogate | null
		{		
			const recursive = (obj: Surrogate): Surrogate | null => 
			{
				if (obj[typeOf].parallelRoots.some(x => x === type[typeOf]))
					return obj;
				
				for (const child of obj.contents)
				{
					const res = recursive(child);	
					if (res)
						return res;
				}
				
				return null;
			};
			
			return recursive(<any>this);
		}
		
		
		/** */
		toJSON(): any 
		{ 
			if (this instanceof Surrogate && this.constructor !== Surrogate)
				return this[value];
				
			const Obj: Record<string | typeof value, Surrogate | T> & { $: any } = <any>Object.assign({}, this);
			
			if (this[value] !== null && this[value] !== undefined ) 
				Obj[value] = this[value]!;
				
			return Obj; 
		}
	}
	
	export class SurrogateString extends Surrogate<string>
	{
		/** */
		get [value]()
		{
			const val = this[typeOf].value;
			return val ? JSON.parse(val) : null;
		}
	}
	
	export class SurrogateNumber extends Surrogate<number>
	{
		/** */
		get [value]()
		{
			const val = this[typeOf].value;
			return val ? Number(val) : null;
		}
	}
	export class SurrogateBigInt extends Surrogate<BigInt>
	{
		/** */
		get [value]()
		{
			const val = this[typeOf].value;
			return val ? BigInt(val) : null;
		}
	}
	export class SurrogateBoolean extends Surrogate
	{
		/** */
		get [value]()
		{
			const val = this[typeOf].value;
			return val ? JSON.parse(val) : null;
		}
	}
}

declare const any: typeof Backer.Surrogate;
declare const string: typeof Backer.SurrogateString;
declare const number: typeof Backer.SurrogateNumber;
declare const bigint: typeof Backer.SurrogateBigInt;
declare const boolean: typeof Backer.SurrogateBoolean;
