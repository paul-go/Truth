
namespace Backer
{
	export type DataJSON = [[number, string, string[]], ...string[][]];
	export type TypeJSON = [number, number | null, string, string[]];
	
	export class Type 
	{
		static fromJSON(code: Code, data: TypeJSON)
		{
			return new Type(
				code, 
				data[2],
				code.prototypes[data[0]],
				data[1] ? FutureType.$(data[1]) : null,
				data[3]
			);
		}
		
		constructor(
			private code: Code,
			public name: string,
			public prototype: Prototype,
			private _container: FutureType | null = null,
			
			public aliases: string[] = []) {}
			
		get PLAConstructor()
		{
			return (
				this.is(this.code.types[5]) ? Backer.Boolean :
				this.is(this.code.types[4]) ? Backer.BigInt  :
				this.is(this.code.types[3]) ? Backer.Number  :
				this.is(this.code.types[2]) ? Backer.String  :
				this.is(this.code.types[1]) || this.value == null ? Backer.Object  : Backer.Any);
				
		}
			
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
		
		/**
		 * Gets the first alias stored in the .values array, or null if the
		 * values array is empty.
		 */
		get value()
		{
			return this.aliases.length > 0 ? this.aliases[0] : null;
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
	}
}