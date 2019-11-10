
namespace Backer
{
	export type ValueJSON = [number, number, string];
	export type DataJSON = [number[], string, ...ValueJSON[][]];
	export type TypeJSON = [number, number | null, string, ValueJSON[]];
	
	export class Value
	{
		static load(data: ValueJSON)
		{
			return new Value(FutureType.new(data[0]), !!data[1], data[2]);
		}
		
		public value: any;
		
		constructor(public base: FutureType | null, public aliased: boolean, value: string) 
		{
			this.value = value;
		}
		
		get primitive()
		{
			return this.value || this.baseName;
		}
		
		get baseName()
		{
			return this.base ? this.base.type ? this.base.type.name : "" : "";	
		}
		
		toJSON()
		{
			return [this.base && this.base.id, this.aliased ? 1 : 0, this.value];  
		}
		
		toString()
		{
			return this.primitive;
		}
	}
	
	export class ValueStore
	{	
		static load(...data: ValueJSON[])
		{
			return new ValueStore(...data.map(x => Value.load(x)));
		}
		
		public valueStore: Value[];
		
		constructor(...values: Value[])
		{
			this.valueStore = values.map(x => 
			{
				if (x.aliased)
				{
					try 
					{
						x.value = JSON.parse(x.value);
					}
					catch (ex)
					{
						if (/^\d+$/.test(x.value))
							x.value = BigInt(x.value);
					}
				}
				return x;
			});
		}
		
		get values()
		{
			return this.valueStore.filter(x => !x.aliased);
		}
		
		get aliases()
		{
			return this.valueStore.filter(x => x.aliased);
		}
		
		concat(store: ValueStore)
		{
			return new ValueStore(...this.valueStore.concat(store.valueStore));
		}
		
		get alias()
		{
			return this.aliases[0];
		}
		
		get value()
		{
			return this.values[0];
		}
		
		get primitive()
		{
			return this.alias ? this.alias.value : this.value.toString();
		}
		
		toJSON()
		{
			return this.valueStore;
		}
	
		toString()
		{
			return this.alias ? this.alias.toString() + (this.value ? "[" + this.value.toString() + "]" : "") : this.value.toString();
		}
		
	}
	
	export class Type 
	{
		/**
		 * Load a Backer.Type from CodeJSON
		 */
		static load(code: Code, data: TypeJSON)
		{
			return new Type(
				code, 
				data[2],
				code.prototypes[data[0]],
				data[1] ? FutureType.new(data[1]) : null,
				ValueStore.load(...data[3])
			);
		}
		
		/**
		 * Generate a Backer.Type from Truth.Type
		 */
		static new(code: Code, type: Truth.Type)
		{	
			const name = type.isPattern ? type.name.substr(9) : type.name;
			const instance = new Type(
				code, 
				name, 
				Prototype.new(code, type),
				type.container ? FutureType.new(type.container) : null,
				new ValueStore(...type.values
					.filter(x => name !== x.value)
					.map(x => new Value(x.base ? FutureType.new(x.base) : null, x.aliased, x.value)))
			);
			
			FutureType.TypeMap.set(type, instance);
			return instance;
		}
		
		constructor(
			private code: Code,
			public name: string,
			public prototype: Prototype,
			private _container: FutureType | null = null,
			public values: ValueStore) 
		{ }
			
		get container()
		{
			return this._container && this._container.type;
		}
			
		/**
		 * Stores the array of types that are contained directly by this
		 * one. In the case when this type is a list type, this array does
		 * not include the list's intrinsic types.
		 */
		get contents()
		{
			return this.code.types.filter(x => x.container === this);
		}
		
		/**
		 * @interal
		 */
		get parallelContents()
		{
			const types: Type[] = [];
			
			for (const { type: parallelType } of this.iterate(t => t.parallels, true))
				for (const { type: baseType } of parallelType.iterate(t => t.bases, true))
					for(const content of baseType.contents)
					if (!types.some(x => x.name === content.name))
						types.push(content);
						
			return types;
		}
		
		/**
		 * Stores a reference to the type, as it's defined in it's
		 * next most applicable type.
		 */
		get parallels()
		{
			return this.prototype.parallels.snapshot()
		}
		
		/**
		 * Stores the array of types from which this type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		get bases()
		{
			return this.prototype.bases.snapshot();
		}
		
		/**
		 * Gets an array that contains the patterns that resolve to this type.
		 */
		get patterns()
		{
			return this.prototype.patterns.snapshot();	
		}
		
		
		/**
		 * Gets an array that contains the that share the same containing
		 * type as this one.
		 */
		get adjacents()
		{
			return this.code.types.filter(x => x.container !== this.container && x !== this);
		}
		
		
		/**
		 * Gets an array that contains the types that derive from the 
		 * this Type instance.
		 * 
		 * The types that derive from this one as a result of the use of
		 * an alias are excluded from this array.
		 */
		get derivations()
		{
			return this.code.types.filter(x => x.bases.includes(this));
		}
		
		/**
		 * Stores a reference to the parallel roots of this type.
		 * The parallel roots are the endpoints found when
		 * traversing upward through the parallel graph.
		 */
		get parallelRoots()
		{
			const roots: Type[] = [];
			for (const { type } of this.iterate(t => t.parallels))
				if (type !== this && type.parallels.length === 0)
					roots.push(type);
			
			return roots;
		}
		
		get value()
		{
			return this.values.primitive;
		}
		
		get id()
		{
			return this.code.types.indexOf(this);
		}
		
		get isAnonymous()
		{
			return this.prototype.flags.get(0);
		}
		
		get isFresh()
		{
			return this.prototype.flags.get(1);
		}
		
		get isList()
		{
			return this.prototype.flags.get(2);
		}
		
		/**
		 * Stores whether this type represents the intrinsic
		 * side of a list.
		 */
		get isListIntrinsic()
		{
			return this.prototype.flags.get(3);
		}
		
		/**
		 * Stores whether this type represents the extrinsic
		 * side of a list.
		 */
		get isListExtrinsic()
		{
			return this.prototype.flags.get(4);
		}
		
		
		get isPattern()
		{
			return this.prototype.flags.get(5);
		}
		
		get isUri()
		{
			return this.prototype.flags.get(6);
		}
		
		/**
		 * Stores a value that indicates if this Type was directly specified
		 * in the document, or if it's existence was inferred.
		 */
		get isSpecified()
		{
			return this.prototype.flags.get(7);
		}
		
		/** */
		get isOverride() { return this.parallels.length > 0; }
		
		/** */
		get isIntroduction() { return this.parallels.length === 0; }
		
		/**
		 * Gets a boolean value that indicates whether this Type
		 * instance was created from a previous edit frame, and
		 * should no longer be used.
		 */
		get isDirty()
		{
			return false;
		}
		
		/**
		 * Performs an arbitrary recursive, breadth-first traversal
		 * that begins at this Type instance. Ensures that no types
		 * types are yielded multiple times.
		 * 
		 * @param nextFn A function that returns a type, or an
		 * iterable of types that are to be visited next.
		 * @param reverse An optional boolean value that indicates
		 * whether types in the returned array should be sorted
		 * with the most deeply visited nodes occuring first.
		 * 
		 * @returns An array that stores the list of types that were
		 * visited.
		 */
		visit(nextFn: (type: Type) => Iterable<Type | null> | Type | null, reverse?: boolean)
		{
			return Array.from(this.iterate(nextFn, reverse)).map(entry => entry.type);
		}
		
		/**
		 * Performs an arbitrary recursive, breadth-first iteration
		 * that begins at this Type instance. Ensures that no types
		 * types are yielded multiple times.
		 * 
		 * @param nextFn A function that returns a type, or an iterable
		 * of types that are to be visited next.
		 * @param reverse An optional boolean value that indicates
		 * whether the iterator should yield types starting with the
		 * most deeply nested types first.
		 * 
		 * @yields An object that contains a `type` property that is the
		 * the Type being visited, and a `via` property that is the Type
		 * that was returned in the previous call to `nextFn`.
		 */
		*iterate(nextFn: (type: Type) => Iterable<Type | null> | Type | null, reverse?: boolean)
		{
			const yielded: Type[] = [];
			
			type RecurseType = IterableIterator<{ type: Type; via: Type | null }>;
			function *recurse(type: Type, via: Type | null): RecurseType
			{
				if (yielded.includes(type))
					return;
				
				if (!reverse)
				{
					yielded.push(type);
					yield { type, via };
				}
				
				const reduced = nextFn(type);
				if (reduced !== null && reduced !== undefined)
				{
					if (reduced instanceof Type)
						return yield *recurse(reduced, type);
					
					for (const nextType of reduced)
						if (nextType instanceof Type)
							yield *recurse(nextType, type);
				}
				
				if (reverse)
				{
					yielded.push(type);
					yield { type, via };
				}
			}
			
			yield *recurse(this, null);
		}
	
		/**
		 * Queries for a Type that is nested underneath this Type,
		 * at the specified type path.
		 */
		query(...typePath: string[])
		{
			let currentType: Type | null = null;
			
			for (const typeName of typePath)
			{
				const nextType = this.contents.find(type => type.name === typeName);
				if (!nextType)
					break;
				
				currentType = nextType;
			}
			
			return currentType;
		}
		
		/**
		 * Checks whether this Type has the specified type
		 * somewhere in it's base graph.
		 */
		is(baseType: Type)
		{
			for (const { type } of this.iterate(t => t.bases))
				if (type === baseType)
					return true;
			
			return false;
		}
		
		/**
		 * Checks whether this Type has the specified type
		 * somewhere in it's base graph.
		 */
		isRoot(baseType: Type)
		{
			return this.is(baseType) || this.parallelRoots.includes(baseType);
		}
		
		/**
		 * Checks whether the specified type is in this Type's
		 * `.contents` property, either directly, or indirectly via
		 * the parallel graphs of the `.contents` Types.
		 */
		has(type: Type)
		{
			if (this.contents.includes(type))
				return true;
			
			for (const containedType of this.contents)
				if (type.name === containedType.name)
					for (const parallel of containedType.iterate(t => t.parallels))
						if (parallel.type === type)
							return true;
			
			return false;
		}
		
		/**
		 * Transfer ownership of this instance to another Code instance
		 */
		transfer(code: Code)
		{
			this.code = code;
			this.prototype.transfer(code);
		}
		
		toJSON()
		{	
			return [this.prototype.id, this.container && this.container.id, this.name, this.values];
		}
	}
}