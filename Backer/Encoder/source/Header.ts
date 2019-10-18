namespace Backer
{
	const typeOf = Symbol("typeOf");
	const value = Symbol("value");
	
	export class Any<T = string>
	{ 
		readonly [typeOf]: Type;
		readonly [value]: T | null;
		
		protected valueParse(value: string | null): T | null
		{
			return value as any;
		}
		
		constructor(type: Type)
		{
			this[typeOf] = type;
			this[value] = this.valueParse(type.value);
		}
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
			return value as any;
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
