const JSBigInt = BigInt;
const JSString = String;
const JSObject = Object;
type Constructor<T = any> = { new (...args: any[]): T };

namespace Backer
{
	export const DataGraph: Record<string, Boolean | BigInt | Number | String | Object | Any> = {};
	
	export const typeOf = Symbol("typeOf");
	export const value = Symbol("value");
	
	export function PLA(type: Type)
	{
		return new type.PLAConstructor(type);
	}
	
	export class Any<T = string>
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
		
		constructor(type: Type)
		{	
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
				
			JSObject.freeze(this);
		}
		
		*[Symbol.iterator]()
		{
			for (const key in this)
				yield this[key];
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
	
	export class Object extends Any<string>
	{ 
		
	}
	
	export class String extends Any<string>
	{ 
		
		protected valueParse(value: string | null)
		{
			if (value === null)
				return null;
			return JSON.parse(value);
		}
	}
	
	export class Number extends Any<number>
	{
		protected valueParse(value: string | null)
		{
			if (value === null)
				return null;
			return JSON.parse(value);
		}
	}
	
	export class BigInt extends Any<bigint>
	{ 
		
		protected valueParse(value: string | null)
		{
			if (value === null)
				return null;
			return JSBigInt(value.substring(1, -1));
		}
	}
	
	export class Boolean extends Any<boolean>
	{
		
		protected valueParse(value: string | null)
		{
			if (value === null)
				return null;
			return JSON.parse(value);
		}
	}
}

declare const any: typeof Backer.Any;
declare const string: typeof Backer.String;
declare const number: typeof Backer.Number;
declare const bigint: typeof Backer.Number;
declare const boolean: typeof Backer.Number;
