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
				Surrogate : Struct : Struct;
				
			return new constr(type, parentValue);
		}
		
		readonly [typeOf]: Type;
		readonly [parent]: Struct | null;
		
		/** */
		get [values]()
		{
			return this[typeOf].values;
		}
		
		constructor(type: Type, parentValue: Struct | null)
		{
			super();
			this[typeOf] = type;
			this[parent] = parentValue;
			
			Util.shadows(this, false, typeOf, values, TruthTalk.op, parent, TruthTalk.container);
			
			for (const child of type.contents)
				(<any>this)[child.name.replace(/[^\d\w]/gm, () => "_")] = Struct.new(child, this);
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
		get [value]()
		{
			return this[typeOf].value;
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
			const val = this[value];
			const primitive = val ? this[typeOf].values.toString() : undefined;
			
			if (this.contents.length === 0)
				return primitive;
	
			const Obj: Record<string, Surrogate | T> & { $: any } = <any>Object.assign({}, this);
							
			return Obj; 
		}
		
		toString(indent = 0)
		{
			let base = this[typeOf].name;
			const primitive = this[value] ? this[typeOf].values.toString() : undefined;
			
			if (primitive) 
				base += `: ${primitive}`;
				
			if (this.contents.length > 0)
				base += this.contents.map(x => "\n" + x.toString(indent + 1));
			
			return "\t".repeat(indent) + base;
		}
	}
}