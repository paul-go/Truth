const JSBigInt = BigInt;
const JSString = String;
const JSObject = Object;
type Constructor<T = any> = { new (...args: any[]): T };

namespace Backer
{
	export type PLATypes = PLABoolean | PLABigInt | PLANumber | PLAString | PLAObject | PLAAny;
	export const DataGraph: Record<string, PLATypes> = {};
	
	export const typeOf = Symbol("typeOf");
	export const value = Symbol("value");
	
	export function PLA(type: Type)
	{
		return new type.PLAConstructor(type);
	}
	
	export class PLAAny<T = string> extends TruthTalk.Leaves.Surrogate
	{ 
		readonly [typeOf]: Type;
		readonly [value]: T | null;
		
		protected valueParse(value: string | null): T | null
		{
			return value as any;
		}
		
		instanceof(base: any)
		{
			return this[value] instanceof base || this[typeOf].is(base); 
		};
		
		is(base: Type | PLATypes)
		{
			if (base instanceof Type)
				return this[typeOf].is(base);
			return this[typeOf].is(base[typeOf]);
		}
		
		constructor(type: Type)
		{	
			super();
			JSObject.defineProperty(this, value, {
				value: this.valueParse(type.value),
				enumerable: false,
				configurable: false,
				writable: false
			});
			
			JSObject.defineProperty(this, typeOf, {
				value: type,
				enumerable: false,
				configurable: false,
				writable: false
			});
			
			for (const child of type.contents)
				(<any>this)[child.name] = PLA(child);
				
		}
		
		[Symbol.hasInstance](value: any)
		{
			return this.instanceof(value);
		}
		
		toJSON() { return this[value]; }
		valueOf() { return this[value]; }
		toString() 
		{
			const val = this[value];
			if (val === null)
				return val;
			
			return JSString(val);
		}
		[Symbol.toPrimitive]() { return this[value]; }
		get [Symbol.toStringTag]() { return "PLA"; }
	}
	
	export class PLAObject<T = String> extends PLAAny<T>
	{ 
		*[Symbol.iterator](): Iterator<PLATypes>
		{
			for (const key in this)
				yield this[key] as any;
		}
	}
	
	export class PLAString extends PLAObject
	{ 
		
		protected valueParse(value: string | null)
		{
			if (value === null)
				return null;
			return JSON.parse(value);
		}
	}
	
	export class PLANumber extends PLAObject<number>
	{
		protected valueParse(value: string | null)
		{
			if (value === null)
				return null;
			return JSON.parse(value);
		}
	}
	
	export class PLABigInt extends PLAObject<bigint>
	{ 
		protected valueParse(value: string | null)
		{
			if (value === null)
				return null;
			return JSBigInt(value.substring(1, -1));
		}
	}
	
	export class PLABoolean extends PLAObject<boolean>
	{
		
		protected valueParse(value: string | null)
		{
			if (value === null)
				return null;
			return JSON.parse(value);
		}
	}
}

declare const any: typeof Backer.PLAAny;
declare const string: typeof Backer.PLAString;
declare const number: typeof Backer.PLANumber;
declare const bigint: typeof Backer.PLANumber;
declare const boolean: typeof Backer.PLANumber;
