
namespace Truth
{
	/**
	 * A class that represents a fully constructed type within the program.
	 */
	export class Type
	{
		/**
		 * @internal
		 */
		static lookup(name: string, program: Program)
		{
			const context = this.contexts.get(program);
			return context?.typesForTerms.get(name.toLocaleLowerCase()) || [];
		}
		
		/** 
		 * @internal
		 * Constructs one or more Type objects from the specified location.
		 */
		static construct(phrase: Phrase): Type | null
		{
			if (!phrase || phrase.length === 0)
				return null;
			
			const context = this.getContext(phrase);
			
			// If the cached type exists, but hasn't been compiled yet,
			// we can't return it, we need to compile it first.
			const existingType = this.fromPhrase(phrase);
			if (existingType.seed)
				return existingType;
			
			const parallel = context.worker.drill(phrase);
			
			// The drilling procedure can return a null value for the parallel
			// if an attempt is made to dril into some non-existent location
			// area of a document.
			if (parallel === null)
			{
				// Previously, this code was marking the phrase as invalid.
				// Should we continue to do this?
				return null;
			}
			
			const parallelContainment = [parallel];
			
			for (let currentParallel = parallel.container; currentParallel !== null;)
			{
				parallelContainment.unshift(currentParallel);
				currentParallel = currentParallel.container;
			}
			
			let lastType: Type | null = null;
			
			for (const seed of parallelContainment)
			{
				const type = this.fromPhrase(seed.phrase);
				if (type.seed)
				{
					lastType = type;
					continue;
				}
				
				// Warning to developers running the debuggers:
				// This area of the function can cause recursion,
				// feeding back into this method.
				
				type.seed = seed;
				type._container = lastType;
				type._parallels = seed.getParallels().map(p => Type.fromPhrase(p.phrase));
				
				if (seed instanceof ExplicitParallel)
				{
					type._bases = this.basesOf(seed);
				}
				else if (seed instanceof ImplicitParallel)
				{
					const queue: Parallel[] = [seed];
					const explicitParallels: ExplicitParallel[] = [];
					
					for (let i = -1; ++i < queue.length;)
					{
						const current = queue[i];
						if (current instanceof ImplicitParallel)
							queue.push(...current.getParallels());
						
						else if (current instanceof ExplicitParallel)
							explicitParallels.push(current);
					}
					
					type._bases = explicitParallels
						.map(par => this.basesOf(par))
						.reduce((a, b) => a.concat(b), [])
						.filter((v, i, a) => a.indexOf(v) === i);
				}
				else throw Exception.unknownState();
				
				if (seed instanceof ExplicitParallel)
				{
					const sub = seed.phrase.terminal;
					
					if (sub instanceof Pattern)
						type.flags |= Flags.isPattern;
					
					if (sub instanceof KnownUri)
						type.flags |= Flags.isUri;
					
					if (sub instanceof Anon)
						type.flags |= Flags.isAnonymous;
					
					if (seed.getParallels().length === 0)
						type.flags |= Flags.isFresh;
					
					type.flags |= Flags.isExplicit
				}
				
				for (const base of type._bases)
					context.inboundBases.add(base, type);
				
				for (const parallel of type._parallels)
					context.inboundParallels.add(parallel, type);
				
				lastType = type;
			}
			
			return lastType;
		}
		
		/** */
		private static basesOf(ep: ExplicitParallel)
		{
			const bases = Array.from(ep.eachBase());
			return bases.map(entry => Type.fromPhrase(entry.base.phrase));
		}
		
		/**
		 * Returns the Type object that corresponds to the specified phrase,
		 * or constructs a new type when no corresponding phrase object
		 * could be found.
		 */
		private static fromPhrase(phrase: Phrase)
		{
			const context = this.getContext(phrase);
			return context.typesForPhrases.get(phrase) || (() =>
			{
				const type = new Type(phrase);
				context.typesForPhrases.set(phrase, type);
				return type;
			})();
		}
		
		/** 
		 * 
		 */
		private static getContext(fromPhrase: Phrase)
		{
			const program = fromPhrase.containingDocument.program;
			let context = this.contexts.get(program);
			
			if (context === undefined)
			{
				context = new Context(program);
				this.contexts.set(program, context);
			}
			else if (program.version.newerThan(context.version))
			{
				context.reset(program);
			}
			
			return context;
		}
		
		/** */
		private static contexts = new WeakMap<Program, Context>();
		
		/** */
		private constructor(phrase: Phrase)
		{
			this.phrase = phrase;
			this.name = phrase.terminal.toString();
			
			this.context = Type.getContext(phrase);
			const term = this.name.toLocaleLowerCase();
			this.context.typesForTerms.add(term, this);
		}
		
		/** @internal */
		private readonly context: Context;
		
		/**
		 * Stores a text representation of the name of the type,
		 * or a serialized version of the pattern content in the
		 * case when the type is actually a pattern.
		 */
		readonly name: string;
		
		/**
		 * Stores the phrase that specifies where this Type was
		 * found in the document.
		 */
		private readonly phrase: Phrase;
		
		/**
		 * Stores the seed Parallel that is the primary source of information
		 * for the construction of this type. In the case when this field is null,
		 * it can be assumed that the type has not been compiled.
		 */
		private seed: Parallel | null = null;
		
		/**
		 * Stores an array of Statement objects that are responsible
		 * for the initiation of this type. In the case when this Type
		 * object represents a path that is implicitly defined, the
		 * array is empty. For example, given the following document:
		 * 
		 * ```
		 * Class
		 * 	Field
		 * SubClass : Class
		 * ```
		 * 
		 * The type at path SubClass/Field is an implicit type, and
		 * therefore, although a valid type object, has no phyisical
		 * statements associated.
		 */
		get statements()
		{
			guard(this, this.seed);
			
			if (this._statements !== null)
				return this._statements;
			
			return this._statements = this.seed instanceof ImplicitParallel ?
				this.seed.phrase.statements.slice() :
				Object.freeze([]);
		}
		private _statements: readonly Statement[] | null = null;
		
		/**
		 * Stores the Type that contains this Type, or null in
		 * the case when this Type is top-level.
		 */
		get container(): Type | null
		{
			guard(this, this.seed);
			return this._container;
		}
		private _container: Type | null = null;
		
		/**
		 * Stores the array of types that are contained directly by this
		 * one. In the case when this type is a list type, this array does
		 * not include the list's intrinsic types.
		 */
		get containees()
		{
			if (this._containees !== null)
				return this._containees;
			
			guard(this, this.seed);
			const innerSubjects = new Set<Subject>();
			
			// Dig through the parallel graph recursively, and at each parallel,
			// dig through the base graph recursively, and collect all the names
			// that are found.
			for (const { type: parallelType } of this.iterate(t => t.parallels, true))
			{
				for (const { type: baseType } of parallelType.iterate(t => t.bases, true))
				{
					// baseType should always be seeded, however these checks
					// are in place to guard against any possibility of this not being
					// the case.
					let base: Type | null = baseType;
					if (!base.seed)
						base = Type.construct(baseType.phrase);
					
					if (!base)
						continue;
					
					if (baseType.seed instanceof ExplicitParallel)
						for (const subject of baseType.seed.phrase.peekSubjects())
							innerSubjects.add(subject);
				}
			}
				
			const innerTypes = Array.from(innerSubjects)
				.flatMap(subject => this.phrase.peek(subject))
				.map(phrase => Type.construct(phrase))
				.filter((t): t is Type => t !== null);
			
			return this._containees = Object.freeze(innerTypes);
		}
		private _containees: readonly Type[] | null = null;
		
		/**
		 * Stores the array of types that are contained directly by this
		 * one. In the case when this type is not a list type, this array
		 * is empty.
		 */
		get containeesIntrinsic()
		{
			if (this._containeesIntrinsic !== null)
				return this._containeesIntrinsic;
			
			if (!this.isListIntrinsic && !this.isListExtrinsic)
				return this._containeesIntrinsic = Object.freeze([]);
			
			guard(this, this.seed);
			throw Exception.notImplemented();
		}
		private _containeesIntrinsic: readonly Type[] | null = null;
		
		/**
		 * Stores the array of types from which this type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		get bases(): readonly Type[]
		{
			guard(this, this.seed);
			return this._bases;
		}
		private _bases: readonly Type[] = [];
		
		/**
		 * Stores a reference to the type, as it's defined in it's
		 * next most applicable type.
		 */
		get parallels()
		{
			guard(this, this.seed);
			return this._parallels;
		}
		private _parallels: readonly Type[] = [];
		
		/**
		 * Stores a reference to the parallel roots of this type.
		 * The parallel roots are the endpoints found when
		 * traversing upward through the parallel graph.
		 */
		get parallelRoots()
		{
			if (this._parallelRoots !== null)
				return this._parallelRoots;
			
			guard(this, this.seed);
			
			const roots: Type[] = [];
			for (const { type } of this.iterate(t => t.parallels))
				if (type !== this && type.parallels.length === 0)
					roots.push(type);
			
			return this._parallelRoots = Object.freeze(roots);
		}
		private _parallelRoots: readonly Type[] | null = null;
		
		/**
		 * Gets an array that contains the Types that share the same 
		 * containing type (as represented in the .container property)
		 * as this one.
		 */
		get adjacents()
		{
			if (this._adjacents !== null)
				return this._adjacents;
			
			guard(this, this.seed);
			
			if (this.container)
				return this._adjacents = this.container.containees.filter(t => t !== this);
			
			const document = this.phrase.containingDocument;
			const roots = Array.from(Phrase.rootsOf(document));
			
			const adjacents = roots
				.map(phrase => Type.construct(phrase))
				.filter((t): t is Type => t !== null && t !== this);
			
			return this._adjacents = Object.freeze(adjacents);
		}
		private _adjacents: readonly Type[] | null = null;
		
		/**
		 * @internal
		 * Not implemented.
		 */
		get superordinates()
		{
			if (this._superordinates !== null)
				return this._superordinates;
			
			throw Exception.notImplemented();
			
			// eslint-disable-next-line no-unreachable
			return this._superordinates = Object.freeze([]);
		}
		private _superordinates: readonly Type[] | null = null;
		
		/**
		 * @internal
		 * Not implemented.
		 */
		get subordinates()
		{
			if (this._subordinates !== null)
				return this._subordinates;
			
			throw Exception.notImplemented();
			
			// eslint-disable-next-line no-unreachable
			return this._subordinates = Object.freeze([]);
		}
		private _subordinates: readonly Type[] | null = null;
		
		/**
		 * Gets an array that contains the patterns that resolve to this type.
		 */
		get patterns()
		{
			if (this._patterns !== null)
				return this._patterns;
			
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
						.map(b => b.phrase.toString())
						.join(Syntax.terminal));
				
				for (let i = -1; ++i < applicablePatternTypes.length;)
				{
					const baseLabel = applicablePatternsBasesLabels[i];
					if (!patternMap.has(baseLabel))
						patternMap.set(baseLabel, applicablePatternTypes[i]);
				}
			}
			
			const out = Array.from(patternMap.values());
			return this._patterns = Object.freeze(out);
		}
		private _patterns: readonly Type[] | null = null;
		
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
			if (this._aliases !== null)
				return this._aliases;
			
			const aliases: string[] = [];
			
			const extractAlias = (ep: ExplicitParallel) =>
			{
				for (const { fork, aliased } of ep.eachBase())
					if (aliased)
						aliases.push(fork.term.toString());
			};
			
			if (this.seed instanceof ExplicitParallel)
			{
				extractAlias(this.seed);
			}
			else if (this.seed instanceof ImplicitParallel)
			{
				const queue: ImplicitParallel[] = [this.seed];
				
				for (let i = -1; ++i < queue.length;)
				{
					const current = queue[i];
					
					for (const parallel of current.getParallels())
					{
						if (parallel instanceof ExplicitParallel)
							extractAlias(parallel);
						
						else if (parallel instanceof ImplicitParallel)
							queue.push(parallel);
					}
				}
			}
			
			return this._aliases = aliases;
		}
		private _aliases: readonly string[] | null = null;
		
		/**
		 * 
		 */
		get values()
		{
			if (this._values !== null)
				return this._values;
			
			const values: { value: string, base: Type | null, aliased: boolean }[] = [];
			
			const extractType = (ep: ExplicitParallel) =>
			{
				for (const { fork, aliased } of ep.eachBase())
					values.push({
						aliased,
						value: fork.term.toString(),
						base: Type.construct(fork.predecessor)
					});
			};
			
			if (this.seed instanceof ExplicitParallel)
			{
				extractType(this.seed);
			}
			else if (this.seed instanceof ImplicitParallel)
			{
				const queue: ImplicitParallel[] = [this.seed];
				
				for (let i = -1; ++i < queue.length;)
				{
					const current = queue[i];
					
					for (const parallel of current.getParallels())
					{
						if (parallel instanceof ExplicitParallel)
							extractType(parallel);
						
						else if (parallel instanceof ImplicitParallel)
							queue.push(parallel);
					}
				}
			}
			
			return this._values = values;
		}
		private _values: readonly { 
			value: string;
			base: Type | null;
			aliased: boolean;
		}[] | null = null;
		
		/**
		 * Gets the first alias stored in the .values array, or null if the
		 * values array is empty.
		 */
		get value()
		{
			return this.aliases.length > 0 ? this.aliases[0] : null;
		}
		
		/**
		 * Iterates through each type that has this type as a base.
		 * Types that derive from this one as a result of the use
		 * of an alias are excluded from this array.
		 */
		async *eachInboundBase()
		{
			guard(this, this.seed);
			const context = Type.getContext(this.phrase);
			await context.program.await();
			const types = context.inboundBases.get(this);
			
			if (types)
				for (const type of types)
					yield type;
		}
		
		/**
		 * Iterates through each type in the program that have 
		 * this type as a parallel.
		 */
		async *eachInboundParallel()
		{
			guard(this, this.seed);
			const context = Type.getContext(this.phrase);
			await context.program.await();
			const types = context.inboundParallels.get(this);
			
			if (types)
				for (const type of types)
					yield type;
		}
		
		/** */
		get isOverride() { return this.parallels.length > 0; }
		
		/** */
		get isIntroduction() { return this.parallels.length === 0; }
		
		/**
		 * Gets whether this type represents the intrinsic
		 * side of a list.
		 */
		get isListIntrinsic() { return (this.flags & Flags.isListIntrinsic) === Flags.isListIntrinsic; }
		
		/**
		 * Gets whether this type represents the extrinsic
		 * side of a list.
		 */
		get isListExtrinsic() { return (this.flags & Flags.isListExtrinsic) === Flags.isListExtrinsic; }
		
		/**
		 * Gets whether this Type instance has no annotations applied to it.
		 */
		get isFresh() { return (this.flags & Flags.isFresh) === Flags.isFresh; }
		
		/**
		 * Gets whether this Type was directly specified in the document,
		 * or if it's existence was inferred.
		 */
		get isExplicit() { return (this.flags & Flags.isExplicit) === Flags.isExplicit; }
		
		/**
		 * Gets whether this type is an anonymous type.
		 */
		get isAnonymous() { return (this.flags & Flags.isAnonymous) === Flags.isAnonymous; }
		
		/** */
		get isPattern() { return (this.flags & Flags.isPattern) === Flags.isPattern; }
		
		/** */
		get isUri() { return (this.flags & Flags.isUri) === Flags.isUri; }
		
		private flags = 0;
		
		/**
		 * Gets a boolean value that indicates whether this Type
		 * instance was created from a previous edit frame, and
		 * should no longer be used.
		 */
		get isDirty()
		{
			return this.context.program.version.newerThan(this.context.version);
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
				const nextType = this.containees.find(type => type.name === typeName);
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
		 * `.inners` property, either directly, or indirectly via
		 * the parallel graphs of the `.inners` Types.
		 */
		has(type: Type)
		{
			if (this.containees.includes(type))
				return true;
			
			for (const innerType of this.containees)
				if (type.name === innerType.name)
					for (const parallel of innerType.iterate(t => t.parallels))
						if (parallel.type === type)
							return true;
			
			return false;
		}
		
		/**
		 * Recursively invokes any fold() method provided by
		 * computed types nested within this type.
		 */
		fold()
		{
			throw Exception.notImplemented();
		}
		
		/**
		 * Returns a string representation of this type, suitable for
		 * debugging purposes.
		 */
		toString()
		{
			if ("DEBUG")
			{
				const lines: string[] = [];
				const write = (
					group: string,
					values: readonly Type[] | readonly Phrase[] | readonly string[]) =>
				{
					lines.push("");
					lines.push(group);
					
					for (const value of values)
					{
						const textValue = 
							value instanceof Type ? value.phrase.toString() :
							value instanceof Phrase ? value.toString() :
							value;
						
						lines.push("  " + textValue);
					}
				}
				
				write(".phrase", [this.phrase]);
				write(".container", this.container ? [this.container.phrase] : []);
				write(".containees", this.containees);
				write(".bases", this.bases);
				write(".parallels", this.parallels);
				write(".adjacents", this.adjacents);
				write(".patterns", this.patterns);
				write(".aliases", this.aliases);
				
				lines.shift();
				return lines.join("\n");
			}
			
			return this.phrase.toString();
		}
	}
	
	/**
	 * Ensures whether properties in the type object may be accessed.
	 */
	function guard(type: Type, seed: Parallel | null): asserts seed is Parallel
	{
		if (seed === null)
			throw Exception.unseededType();
		
		if (type.isDirty)
			throw Exception.typeDirty(type);
	}
	
	/**
	 * Stores supporting information for Type objects.
	 * The information stored in this class must have the same lifetime as
	 * the program object that contains the type, rather than the type itself.
	 */
	class Context
	{
		/** */
		constructor(readonly program: Program)
		{
			this.worker = new ConstructionWorker(program);
			this._version = program.version;
		}
		
		/**
		 * Clears out all information in this context.
		 * This method should be called when the program is modified,
		 * and the cached information is therefore no longer valid.
		 */
		reset(program: Program)
		{
			this.typesForPhrases.clear();
			this.typesForTerms.clear();
			this.inboundBases.clear();
			this.inboundParallels.clear();
			this.worker.reset();
			this._version = program.version;
		}
		
		/** */
		get version()
		{
			return this._version;
		}
		private _version: VersionStamp;
		
		/** */
		readonly worker: ConstructionWorker;
		
		/** */
		readonly typesForPhrases = new Map<Phrase, Type>();
		
		/** */
		readonly typesForTerms = new MultiMap<string, Type>();
		
		/**
		 * Stores a cache of the inbound bases of each constructed type.
		 * This MultiMap is constructed progressively as more types are constructed.
		 */
		readonly inboundBases = new SetMap<Type, Type>();
		
		/**
		 * Stores a cache of the inbound parallels of each constructed type.
		 * This MultiMap is constructed progressively as more types are constructed.
		 */
		readonly inboundParallels = new SetMap<Type, Type>();
	}
	
	/** */
	const enum Flags
	{
		isListIntrinsic = 0,
		isListExtrinsic = 1,
		isFresh = 2,
		isExplicit = 3,
		isAnonymous = 4,
		isPattern = 5,
		isUri = 6
	}
}
