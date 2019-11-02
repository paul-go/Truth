
type Constructor<T = any> = { new (...args: any[]): T };

namespace Backer
{
	export type PLATypes = PLABoolean | PLABigInt | PLANumber | PLAString | PLAObject | PLAAny;
	
	export type ObjectType<T extends PLAObject = PLAObject> = T & Record<string, T>;
	export const DataGraph: Record<string, ObjectType> = {};
	
	export const typeOf = Symbol("typeOf");
	export const value = Symbol("value");
	
	export function PLA(type: Type, parent: ObjectType | null)
	{
		return new type.PLAConstructor(type, parent);
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
		
		constructor(type: Type, public parent: ObjectType | null)
		{	
			super();
			Object.defineProperty(this, value, {
				value: this.valueParse(type.value),
				enumerable: false,
				configurable: false,
				writable: false
			});
			
			Object.defineProperty(this, typeOf, {
				value: type,
				enumerable: false,
				configurable: false,
				writable: false
			});
			
			Object.defineProperties(this, {
				op: { enumerable: false },
				parent: { enumerable: false },
				_container: { enumerable: false },
			});
			
			for (const child of type.contents)
				(<any>this)[child.name] = PLA(child, <any>this);
		}
		
		get contents(): Array<PLATypes>
		{
			return Object.values(this);
		}
		
		get root()
		{
			let root: PLAObject = <any>this;
			
			while (root.parent) 
				root = root.parent;
			
			return root;
		}
		
		[Symbol.hasInstance](value: any)
		{
			return this.instanceof(value);
		}
		
		toJSON(): any { return this[value]; }
		valueOf() { return this[value]; }
		toString() 
		{
			const val = this[value];
			if (val === null)
				return val;
			
			return String(val);
		}
		[Symbol.toPrimitive]() { return this[value]; }
		get [Symbol.toStringTag]() { return "PLA"; }
	}
	
	export class PLAObject<T = String> extends PLAAny<T>
	{	
		get(type: PLAAny): PLAObject | null
		{		
			const recursive = (obj: PLAObject): PLAObject | null => 
			{
				if (obj[typeOf].parallelRoots.some(x => x === type[typeOf]))
					return obj;
				
				for (const child of obj.contents)
				{
					const res = recursive(<PLAObject>child);	
					if (res)
						return res;
				}
				
				return null;
			};
			
			return recursive(<any>this);
		}
		
		
		toJSON(): any 
		{ 
			if (this instanceof PLAObject && this.constructor !== PLAObject)
				return this[value];
				
			const Obj: Record<string, PLAObject> & { $: any } = <any>Object.assign({}, this);
			if (this[value] !== null && this[value] !== undefined ) 
				Obj.$ = this[value];
			return Obj; 
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
			return BigInt(value.substring(1, -1));
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
