/// <reference path="Nodes.ts"/>

namespace Backer
{
	export const typeOf = Symbol("typeOf");
	export const value = Symbol("value");
	export const name = Symbol("name");
	export const values = Symbol("values");
	export const parent = Symbol("parent");
	
	/**
	 * 
	 */
	export abstract class Base<T, Q> extends TruthTalk.Leaves.Surrogate
	{
		/** */
		abstract [name]: string | Name;
		
		/** */
		abstract [value]: T;
		
		/**
		 * 
		 */
		[parent]: Q | null;
		
		/** */
		constructor(parentValue: Q | null)
		{
			super();
			this[parent] = parentValue;
		}
		
		/**
		 * Climb to root of this Struct
		 */
		get root(): Base<T, Q> | null
		{
			let root: any = this;
			
			while (root && root[parent]) 
				root = root[parent];
			
			return root;
		}
		
		/** */
		toJSON()
		{
			return this[value];
		}
		
		/** */
		valueOf()
		{
			return this[value];
		}
		
		/** */
		toString() 
		{
			const val = this[value];
			if (val === null)
				return val;
			
			return String(val);
		}
		
		/** */
		[Symbol.toPrimitive]()
		{
			return this[value];
		}
		
		/** */
		get [Symbol.toStringTag]()
		{
			return "Proxy";
		}
	}
	
	/**
	 * 
	 */
	export class Aggregate extends Base<any, Struct[]>
	{
		/**
		 * 
		 */
		[parent]: Struct[];
		
		/** */
		constructor(public value: any, containers: Struct[], private _name: string)
		{
			super(containers);
		}
		
		/** */
		get [value]()
		{
			return this.value;
		}
		
		/** */
		get [name]()
		{
			return this._name || this[parent].map(v => v[name]).join(",");
		}
	}
	
	/**
	 * 
	 */
	export class Name extends Base<string, Struct>
	{
		/** */
		constructor(public name: string, container: Struct | null)
		{
			super(container);
		}
		
		/** */
		get [value]()
		{
			return this.name;
		}
		
		/** */
		get [name]()
		{
			return "name";
		}
	}
	
	/**
	 * 
	 */
	export class Struct extends Base<any, Struct | Surrogate>
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
		readonly [name]: Name;
		readonly [parent]: Struct | null;
		
		/** */
		get [values]()
		{
			return this[typeOf].values;
		}
		
		/** */
		get [value]()
		{
			return this[typeOf].value;
		}
		
		/** */
		constructor(type: Type, parentValue: Struct | null)
		{
			super(parentValue);
			this[typeOf] = type;
			this[parent] = parentValue;
			this[name] = new Name(type.name, this);
			
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
	}
	
	/**
	 * 
	 */
	export class Surrogate<T = string> extends Struct
	{
		readonly [name]: Name;
		readonly [parent]: Surrogate | null;
		
		/** */
		get contents(): Surrogate[]
		{
			return Object.values(this);
		}
		
		/** */
		get bases(): Struct[]
		{
			return this[typeOf].bases.map(x => Backer.Schema[x.name]);
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
		
		/** */
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
