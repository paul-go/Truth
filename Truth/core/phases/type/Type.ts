
namespace Truth
{
	/** */
	interface IStoredContext
	{
		version: VersionStamp;
		worker: ConstructionWorker;
	}

	/**
	 * A class that represents a fully constructed type within the program.
	 */
	export class Type
	{
		/** 
		 * @internal
		 * Constructs one or more Type objects from the specified location.
		 */
		static construct(uri: Uri, program: Program): Type | null;
		static construct(spine: Spine, program: Program): Type;
		static construct(param: Uri | Spine, program: Program): Type | null
		{
			const uri = Uri.clone(param);
			if (uri.types.length === 0)
				return null;
			
			if (TypeCache.has(uri, program))
			{
				const cached = TypeCache.get(uri, program);
				
				// If the cached type exists, but hasn't been compiled yet,
				// we can't return it, we need to compile it first.
				if (cached === null || cached instanceof Type)
					return cached as Type;
			}
			
			const worker = (() =>
			{
				const stored = this.parallelContextMap.get(program);
				if (stored === undefined)
				{
					const newStored: IStoredContext = {
						version: program.version,
						worker: new ConstructionWorker(program)
					};
					
					this.parallelContextMap.set(program, newStored);
					return newStored.worker;
				}
				else if (program.version.newerThan(stored.version))
				{
					stored.version = program.version;
					stored.worker = new ConstructionWorker(program);
				}
				
				return stored.worker;
			})();
			
			const parallel = worker.drill(uri);
			if (parallel === null)
			{
				TypeCache.set(uri, program, null);
				return null;
			}
			
			const parallelLineage = [parallel];
			
			for (let currentParallel = parallel.container; currentParallel !== null;)
			{
				parallelLineage.unshift(currentParallel);
				currentParallel = currentParallel.container;
			}
			
			let lastType: Type | null = null;
			
			for (const currentParallel of parallelLineage)
			{
				if (TypeCache.has(currentParallel.uri, program))
				{
					const existingType = TypeCache.get(currentParallel.uri, program);
					if (existingType instanceof TypeProxy)
						throw Exception.unknownState();
					
					if (existingType === null)
						throw Exception.unknownState();
					
					lastType = existingType;
				}
				else
				{
					const type: Type = new Type(currentParallel, lastType, program);
					TypeCache.set(currentParallel.uri, program, type);
					lastType = type;
				}
			}
			
			return lastType;
		}
		
		/**
		 * @internal
		 * Constructs the invisible root-level Type object that corresponds
		 * to the specified document.
		 */
		static constructRoots(document: Document)
		{
			const program = document.program;
			const roots: Type[] = [];
			
			for (const node of program.graph.readRoots(document))
			{
				const type = this.construct(node.uri, program);
				if (type !== null)
					roots.push(type);
			}
			
			return Object.freeze(roots);
		}
		
		/** */
		private static parallelContextMap = new WeakMap<Program, IStoredContext>();
		
		/**
		 * 
		 */
		private constructor(
			seed: Parallel,
			container: Type | null,
			program: Program)
		{
			this.private = new TypePrivate(program, seed);
			this.name = seed.uri.types[seed.uri.types.length - 1].value;
			this.uri = seed.uri;
			this.container = container;
			
			this.private.parallels = new TypeProxyArray(
				seed.getParallels().map(edge =>
					new TypeProxy(edge.uri, program)));
			
			const getBases = (sp: SpecifiedParallel) =>
			{
				const bases = Array.from(sp.eachBase());
				return bases.map(entry => 
					new TypeProxy(entry.base.node.uri, program));
			};
			
			if (seed instanceof SpecifiedParallel)
			{
				this.private.bases = new TypeProxyArray(getBases(seed));
			}
			else if (seed instanceof UnspecifiedParallel)
			{
				const queue: Parallel[] = [seed];
				const specifiedParallels: SpecifiedParallel[] = [];
				
				for (let i = -1; ++i < queue.length;)
				{
					const current = queue[i];
					if (current instanceof UnspecifiedParallel)
						queue.push(...current.getParallels());
					
					else if (current instanceof SpecifiedParallel)
						specifiedParallels.push(current);
				}
				
				const bases = specifiedParallels
					.map(par => getBases(par))
					.reduce((a, b) => a.concat(b), [])
					.filter((v, i, a) => a.indexOf(v) === i);
				
				this.private.bases = new TypeProxyArray(bases);
			}
			
			this.isList = false;
			
			if (seed instanceof SpecifiedParallel)
			{
				const sub = seed.node.subject;
				this.isPattern = sub instanceof Pattern;
				this.isUri = sub instanceof Uri;
				this.isAnonymous = sub instanceof Anon;
				this.isSpecified = true;
				this.isFresh = seed.getParallels().length === 0;
			}
		}
		
		/**
		 * Stores a text representation of the name of the type,
		 * or a serialized version of the pattern content in the
		 * case when the type is actually a pattern.
		 */
		readonly name: string;
		
		/**
		 * Stores the URI that specifies where this Type was
		 * found in the document.
		 */
		readonly uri: Uri;
		
		/**
		 * Stores a reference to the type, as it's defined in it's
		 * next most applicable type.
		 */
		get parallels()
		{
			this.private.throwOnDirty();
			return Not.null(this.private.parallels).maybeCompile();
		}
		
		/**
		 * Stores a reference to the parallel roots of this type.
		 * The parallel roots are the endpoints found when
		 * traversing upward through the parallel graph.
		 */
		get parallelRoots()
		{
			this.private.throwOnDirty();
			
			if (this.private.parallelRoots !== null)
				return this.private.parallelRoots;
			
			const roots: Type[] = [];
			for (const { type } of this.iterate(t => t.parallels))
				if (type !== this && type.parallels.length === 0)
					roots.push(type);
			
			return this.private.parallelRoots = Object.freeze(roots);
		}
		
		/**
		 * Stores the Type that contains this Type, or null in
		 * the case when this Type is top-level.
		 */
		readonly container: Type | null;
		
		/**
		 * Stores the array of types that are contained directly by this
		 * one. In the case when this type is a list type, this array does
		 * not include the list's intrinsic types.
		 */
		get contents()
		{
			if (this.private.contents !== null)
				return this.private.contents;
			
			this.private.throwOnDirty();
			const containedNames: string[] = [];
			
			// Dig through the parallel graph recursively, and at each parallel,
			// dig through the base graph recursively, and collect all the names
			// that are found.
			for (const { type: parallelType } of this.iterate(t => t.parallels, true))
				for (const { type: baseType } of parallelType.iterate(t => t.bases, true))
					if (baseType.private.seed instanceof SpecifiedParallel)
						for (const name of baseType.private.seed.node.contents.keys())
							if (!containedNames.includes(name))
								containedNames.push(name);
			
			const contents = containedNames
				.map(containedName =>
				{
					const maybeContainedUri = this.uri.extendType(containedName);
					return Type.construct(maybeContainedUri, this.private.program);
				})
				.filter((t): t is Type => t !== null);
			
			return this.private.contents = Object.freeze(contents);
		}
		
		/**
		 * @internal
		 * Stores the array of types that are contained directly by this
		 * one. In the case when this type is not a list type, this array
		 * is empty.
		 */
		get contentsIntrinsic()
		{
			if (this.private.contentsIntrinsic !== null)
				return this.private.contentsIntrinsic;
			
			if (!this.isList)
				return this.private.contentsIntrinsic = Object.freeze([]);
			
			this.private.throwOnDirty();
			
			throw Exception.notImplemented();
		}
		
		/**
		 * Stores the array of types from which this type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		get bases(): readonly Type[]
		{
			this.private.throwOnDirty();
			
			if (this.private.bases === null)
				throw Exception.unknownState();
			
			return this.private.bases.maybeCompile();
		}
		
		/**
		 * @internal
		 * Not implemented.
		 */
		get superordinates()
		{
			if (this.private.superordinates !== null)
				return this.private.superordinates;
			
			this.private.throwOnDirty();
			throw Exception.notImplemented();
			
			// eslint-disable-next-line no-unreachable
			return this.private.superordinates = Object.freeze([]);
		}
		
		/**
		 * @internal
		 */
		get subordinates()
		{
			if (this.private.subordinates !== null)
				return this.private.subordinates;
			
			this.private.throwOnDirty();
			throw Exception.notImplemented();
			
			// eslint-disable-next-line no-unreachable
			return this.private.subordinates = Object.freeze([]);
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
			if (this.private.derivations !== null)
				return this.private.derivations;
			
			this.private.throwOnDirty();
			
			if (!(this.private.seed instanceof SpecifiedParallel))
				return this.private.derivations = Object.freeze([]);
			
			const derivations = Array.from(this.private.seed.node.inbounds)
				.map(ib => ib.predecessor.uri)
				.map(uri => Type.construct(uri, this.private.program))
				.filter((t): t is Type => t instanceof Type)
				.filter(type => type.bases.includes(this));
			
			return this.private.derivations = Object.freeze(derivations);
		}
		
		/**
		 * Gets an array that contains the that share the same containing
		 * type as this one.
		 */
		get adjacents()
		{
			if (this.private.adjacents !== null)
				return this.private.adjacents;
			
			this.private.throwOnDirty();
			
			if (this.container)
				return this.private.adjacents = this.container.contents.filter(t => t !== this);
			
			const program = this.private.program;
			const document = Not.null(program.documents.get(this.uri));
			const roots = Array.from(this.private.program.graph.readRoots(document));
			const adjacents = roots
				.map(node => Type.construct(node.uri, program))
				.filter((t): t is Type => t !== null && t !== this);
			
			return this.private.adjacents = Object.freeze(adjacents);
		}
		
		/**
		 * Gets an array that contains the patterns that resolve to this type.
		 */
		get patterns()
		{
			if (this.private.patterns !== null)
				return this.private.patterns;
			
			this.private.throwOnDirty();
			
			// Stores a map whose keys are a concatenation of the Uris of all
			// the bases that are matched by a particular pattern, and whose
			// values are the type object containing that pattern. This map
			// provides an easy way to determine if there is already a pattern
			// that matches a particular set of types in the type scope.
			const patternMap = new Map<string, Type>();
			
			for (const { type } of this.iterate(t => t.container))
			{
				const applicablePatternTypes = type.adjacents
					.filter(t => t.isPattern)
					.filter(t => t.bases.includes(type));
				
				const applicablePatternsBasesLabels =
					applicablePatternTypes.map(p => p.bases
						.map(b => b.uri.toString())
						.join(Syntax.terminal));
				
				for (let i = -1; ++i < applicablePatternTypes.length;)
				{
					const baseLabel = applicablePatternsBasesLabels[i];
					if (!patternMap.has(baseLabel))
						patternMap.set(baseLabel, applicablePatternTypes[i]);
				}
			}
			
			const out = Array.from(patternMap.values());
			return this.private.patterns = Object.freeze(out);
		}
		
		/**
		 * Gets an array that contains the raw string values representing
		 * the type aliases with which this type has been annotated.
		 * 
		 * If this type is unspecified, the parallel graph is searched,
		 * and any applicable type aliases will be present in the returned
		 * array.
		 */
		get aliases()
		{
			if (this.private.aliases !== null)
				return this.private.aliases;
			
			this.private.throwOnDirty();
			const aliases: string[] = [];
			
			const extractAlias = (sp: SpecifiedParallel) =>
			{
				for (const { edge, aliased } of sp.eachBase())
					if (aliased)
						aliases.push(edge.identifier.toString());
			};
			
			if (this.private.seed instanceof SpecifiedParallel)
			{
				extractAlias(this.private.seed);
			}
			else if (this.private.seed instanceof UnspecifiedParallel)
			{
				const queue: UnspecifiedParallel[] = [this.private.seed];
				
				for (let i = -1; ++i < queue.length;)
				{
					const current = queue[i];
					
					for (const parallel of current.getParallels())
					{
						if (parallel instanceof SpecifiedParallel)
							extractAlias(parallel);
						
						else if (parallel instanceof UnspecifiedParallel)
							queue.push(parallel);
					}
				}
			}
			
			return this.private.aliases = aliases;
		}
		
		/**
		 * 
		 */
		get values()
		{
			if (this.private.values !== null)
				return this.private.values;
			
			this.private.throwOnDirty();
			const values: { value: string, base: Type | null, aliased: boolean }[] = [];
			
			const extractType = (sp: SpecifiedParallel) =>
			{
				for (const { edge, aliased } of sp.eachBase())
					values.push({
						aliased,
						value: edge.identifier.toString(),
						base: Type.construct(edge.predecessor.uri, this.private.program)
					});
			};
			
			if (this.private.seed instanceof SpecifiedParallel)
			{
				extractType(this.private.seed);
			}
			else if (this.private.seed instanceof UnspecifiedParallel)
			{
				const queue: UnspecifiedParallel[] = [this.private.seed];
				
				for (let i = -1; ++i < queue.length;)
				{
					const current = queue[i];
					
					for (const parallel of current.getParallels())
					{
						if (parallel instanceof SpecifiedParallel)
							extractType(parallel);
						
						else if (parallel instanceof UnspecifiedParallel)
							queue.push(parallel);
					}
				}
			}
			
			return this.private.values = values;
		}
		
		/**
		 * Gets the first alias stored in the .values array, or null if the
		 * values array is empty.
		 */
		get value()
		{
			return this.aliases.length > 0 ? this.aliases[0] : null;
		}
		
		/**
		 * Stores whether this type represents the intrinsic
		 * side of a list.
		 */
		readonly isListIntrinsic: boolean = false;
		
		/**
		 * Stores whether this type represents the extrinsic
		 * side of a list.
		 */
		readonly isListExtrinsic: boolean = false;
		
		/**
		 * Stores whether this Type instance has no annotations applied to it.
		 */
		readonly isFresh: boolean = false;
		
		/** */
		get isOverride() { return this.parallels.length > 0; }
		
		/** */
		get isIntroduction() { return this.parallels.length === 0; }
		
		/**
		 * Stores a value that indicates if this Type was directly specified
		 * in the document, or if it's existence was inferred.
		 */
		readonly isSpecified: boolean = false;
		
		/** */
		readonly isAnonymous: boolean = false;
		
		/** */
		readonly isPattern: boolean = false;
		
		/** */
		readonly isUri: boolean = false;
		
		/** */
		readonly isList: boolean = false;
		
		/**
		 * Gets a boolean value that indicates whether this Type
		 * instance was created from a previous edit frame, and
		 * should no longer be used.
		 */
		get isDirty()
		{
			return this.private.program.version.newerThan(this.private.stamp);
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
		
		/**
		 * @internal
		 * Internal object that stores the private members
		 * of the Type object. Do not use.
		 */
		private readonly private: TypePrivate;
	}


	/**
	 * @internal
	 * A hidden class that stores the private information of
	 * a Type instance, used to mitigate the risk of low-rank
	 * developers from getting themselves into trouble.
	 */
	class TypePrivate
	{
		constructor(
			readonly program: Program,
			readonly seed: Parallel)
		{
			this.stamp = program.version;
		}
		
		/** */
		readonly stamp: VersionStamp;
		
		/** */
		contents: readonly Type[] | null = null;
		
		/** */
		contentsIntrinsic: readonly Type[] | null = null;
		
		/** */
		bases: TypeProxyArray | null = null;
		
		/** */
		parallels: TypeProxyArray | null = null;
		
		/** */
		parallelRoots: readonly Type[] | null = null;
		
		/** */
		patterns: readonly Type[] | null = null;
		
		/** */
		aliases: readonly string[] | null = null;
		
		/** */
		values: readonly { value: string; base: Type | null; aliased: boolean }[] | null = null;
		
		/** */
		superordinates: readonly Type[] | null = null;
		
		/** */
		subordinates: readonly Type[] | null = null;
		
		/** */
		derivations: readonly Type[] | null = null;
		
		/** */
		adjacents: readonly Type[] | null = null;
		
		/** */
		throwOnDirty()
		{
			if (this.program.version.newerThan(this.stamp))
				throw Exception.objectDirty();
		}
	}
}
