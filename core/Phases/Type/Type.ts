
namespace Truth
{
	/**
	 * Represents a fully constructed Type within the program.
	 */
	export class Type
	{
		/** 
		 * @internal
		 * Constructs one or more Type objects from the specified location.
		 */
		static construct(phrase: Phrase): Type | null
		{
			if (!phrase || phrase.length === 0)
				return null;
			
			// If the cached type exists, but hasn't been compiled yet,
			// we can't return it, we need to compile it first.
			const existingType = this.fromPhrase(phrase);
			if (existingType.seed)
				return existingType;
			
			const program = phrase.containingDocument.program;
			const parallel = program.worker.drill(phrase);
			
			// The drilling procedure can return a null value for the parallel
			// if an attempt is made to dril into some non-existent location
			// area of a document.
			if (parallel === null)
				return null;
			
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
				
				// Optimization: surface-level types do not have supervisors
				if (lastType)
					type._supervisors = findSupervisors(seed);
				
				if (seed instanceof ExplicitParallel)
				{
					type._supers = this.basesOf(seed);
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
					
					type._supers = explicitParallels
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
					
					else if (sub instanceof KnownUri)
						type.flags |= Flags.isUri;
					
					else if (sub === Term.anonymous)
						type.flags |= Flags.isAnonymous;
					
					if (seed.getParallels().length === 0)
						type.flags |= Flags.isFresh;
					
					type.flags |= Flags.isExplicit;
				}
				
				if (type.keywords.some(key => key.word === type.name))
					type.flags |= Flags.isRefinement;
				
				const volatile = type.document.isVolatile;
				
				for (const sup of type._supers)
				{
					if (sup.document === type.document)
						sup.subsLocal.push(type);
					
					else if (!volatile)
						program.setForeignSuper(sup, type);
				}
				
				for (const supervisor of type._supervisors)
				{
					if (supervisor.document === type.document)
						supervisor.subvisorsLocal.push(type);
					
					else if (!volatile)
						program.setForeignSupervisor(supervisor, type);
				}
				
				program.addType(type, seed.phrase.id);
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
			const doc = phrase.containingDocument;
			const existing = doc.program.getType(doc, phrase.id);
			if (existing)
				return existing;
			
			const type = new Type(phrase);
			doc.program.addType(type, phrase.id);
			return type;
		}
		
		/** */
		private constructor(phrase: Phrase)
		{
			this.name = phrase.terminal.toString();
			this.phrase = phrase;
		}
		
		/** @internal */
		readonly id = id();
		
		/**
		 * Stores a text representation of the name of the Type,
		 * or a serialized version of the pattern content in the
		 * case when the Type is actually a pattern.
		 */
		readonly name: string;
		
		/**
		 * @internal
		 * Stores the phrase that specifies where this Type was
		 * found in the document.
		 */
		private readonly phrase: Phrase;
		
		/**
		 * Stores the seed Parallel that is the primary source of information
		 * for the construction of this Type. In the case when this field is null,
		 * it can be assumed that the Type has not been compiled.
		 */
		private seed: Parallel | null = null;
		
		/**
		 * Gets the document in which this Type is defined.
		 */
		get document()
		{
			return this.phrase.containingDocument;
		}
		
		/**
		 * Gets an array of Statement objects that are responsible
		 * for the initiation of this Type. In the case when this Type
		 * object represents a path that is implicitly defined, the
		 * array is empty. For example, given the following document:
		 * 
		 * ```
		 * Class
		 * 	Field
		 * SubClass : Class
		 * ```
		 * 
		 * The Type at path SubClass/Field is an implicit Type, and
		 * therefore, although a valid Type object, has no phyisical
		 * statements associated.
		 */
		get statements()
		{
			const seed = this.guard();
			
			if (this._statements)
				return this._statements;
			
			return this._statements = seed.phrase.statements.slice();
		}
		private _statements: readonly Statement[] | null = null;
		
		/**
		 * 
		 */
		get spans()
		{
			const seed = this.guard();
			
			if (this._spans)
				return this._spans;
			
			return this._spans = seed.phrase.declarations.slice();
		}
		private _spans: readonly Span[] | null = null;
		
		/**
		 * Gets the level of containment of this Type. 
		 * Types defined at the top of a document have a level of 1.
		 */
		get level()
		{
			return this.phrase.length;
		}
		
		/**
		 * Gets the Type that contains this Type, or null in
		 * the case when this Type is surface-level.
		 */
		get container(): Type | null
		{
			this.guard();
			return this._container;
		}
		private _container: Type | null = null;
		
		/**
		 * Gets the array of Types that are contained directly by this
		 * one. In the case when this Type is a list, the array does
		 * not include the list's intrinsic Types.
		 */
		get containees()
		{
			if (this._containees !== null)
				return this._containees;
			
			const seed = this.guard();
			const phrases = this.document.program.phrases;
			const innerSubjects = new Set<Subject>();
			
			// Dig through the parallel graph recursively, and at each parallel,
			// dig through the base graph recursively, and collect all the names
			// that are found.
			for (const { type: parallelType } of this.iterate(t => t.supervisors, true))
			{
				for (const { type: superType } of parallelType.iterate(t => t.supers, true))
				{
					// superType should always be seeded, however these checks
					// are in place to guard against any possibility of this not being
					// the case.
					let sup: Type | null = superType;
					if (!sup.seed)
						sup = Type.construct(superType.phrase);
					
					if (!sup)
						continue;
					
					if (superType.seed instanceof ExplicitParallel)
						for (const subject of phrases.peekSubjects(superType.seed))
							innerSubjects.add(subject);
				}
			}
			
			const innerTypes = Array.from(innerSubjects)
				.flatMap(subject => phrases.forward(seed, subject))
				.map(phrase => Type.construct(phrase))
				.filter((t): t is Type => t !== null);
			
			return this._containees = Object.freeze(innerTypes);
		}
		private _containees: readonly Type[] | null = null;
		
		/**
		 * Gets the array of Types that are contained directly by this
		 * one. In the case when this Type is not a list, the array
		 * is empty.
		 */
		get containeesIntrinsic()
		{
			if (this._containeesIntrinsic !== null)
				return this._containeesIntrinsic;
			
			if (!this.isListIntrinsic && !this.isListExtrinsic)
				return this._containeesIntrinsic = Object.freeze([]);
			
			this.guard();
			throw Exception.notImplemented();
		}
		private _containeesIntrinsic: readonly Type[] | null = null;
		
		/**
		 * Gets the array of Types from which this Type extends.
		 * If this Type extends from a pattern, it is included in this
		 * array.
		 */
		get supers(): readonly Type[]
		{
			this.guard();
			return this._supers;
		}
		private _supers: readonly Type[] = [];
		
		/**
		 * Gets the array of Types that extend from this one, either
		 * through an explicit annotation, or an alias.
		 * 
		 * @throws An exception when the containing program
		 * has unverified information.
		 */
		*eachSub()
		{
			this.guard();
			
			for (const sub of this.subsLocal)
				yield sub;
			
			const p = this.document.program;
			for (const sub of p.getForeignTypesReferencingTypeAsSuper(this))
				yield sub;
		}
		private readonly subsLocal: Type[] = [];
		
		/**
		 * Gets a reference to the parallel roots of this Type.
		 * The parallel roots are the endpoints found when
		 * traversing upward through the parallel graph.
		 */
		get chiefs()
		{
			if (this._chiefs !== null)
				return this._chiefs;
			
			this.guard();
			
			const chiefs: Type[] = [];
			for (const { type } of this.iterate(t => t.supervisors))
				if (type !== this && type.supervisors.length === 0)
					chiefs.push(type);
			
			return this._chiefs = Object.freeze(chiefs);
		}
		private _chiefs: readonly Type[] | null = null;
		
		/**
		 * Gets a reference to the Type, as it's defined in it's
		 * next most applicable Type.
		 */
		get supervisors()
		{
			this.guard();
			return this._supervisors;
		}
		private _supervisors: readonly Type[] = [];
		
		/**
		 * Gets the array of Types that have this Type as a supervisor.
		 * 
		 * @throws An exception when the containing program
		 * has unverified information.
		 */
		*eachSubvisor()
		{
			this.guard();
			
			for (const subvisor of this.subvisorsLocal)
				yield subvisor;
			
			const p = this.document.program;
			for (const sub of p.getForeignTypesReferencingTypeAsSupervisor(this))
				yield sub;
		}
		private readonly subvisorsLocal: Type[] = [];
		
		/**
		 * Gets an array that contains the Types that share the same 
		 * containing Type (as represented in the .container property)
		 * as this one.
		 */
		get adjacents()
		{
			if (this._adjacents !== null)
				return this._adjacents;
			
			this.guard();
			
			if (this.container)
				return this._adjacents = this.container.containees.filter(t => t !== this);
			
			const roots = Array.from(Phrase.rootsOf(this.document));
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
			return this._subordinates = Object.freeze([]);
		}
		private _subordinates: readonly Type[] | null = null;
		
		/**
		 * Gets an array that contains the patterns that resolve to this Type.
		 */
		get patterns()
		{
			if (this._patterns !== null)
				return this._patterns;
			
			// Stores a map whose keys are a concatenation of the Uris of all
			// the bases that are matched by a particular pattern, and whose
			// values are the Type object containing that pattern. This map
			// provides an easy way to determine if there is already a pattern
			// that matches a particular set of Types in scope.
			const patternMap = new Map<string, Type>();
			
			for (const { type } of this.iterate(t => t.container))
			{
				const applicablePatternTypes = type.adjacents
					.filter(t => t.isPattern)
					.filter(t => t.supers.includes(type));
				
				const applicablePatternsBasesLabels =
					applicablePatternTypes.map(p => p.supers
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
		 * Gets a table of information about the keywords that are 
		 * associated with this Type, in the order in which they occur
		 * within the document.
		 */
		get keywords()
		{
			if (this._keywords !== null)
				return this._keywords;
			
			const keywords: Keyword[] = [];
			const seed = this.guard();
			
			const storeKeywordsOf = (ep: ExplicitParallel) =>
			{
				for (const { base, fork, alias } of ep.eachBase())
				{
					// In the case when there is no alias, there must only
					// be 0 or 1 fork. The forks array can only have multiple
					// forks in the case when there was a concatenation that
					// occured across multiple aliases (ex: value : "a, b, c")
					const word = alias || fork?.term.toString() || "";
					const baseType = Type.construct(base.phrase);
					if (baseType)
						keywords.push(new Keyword(word, baseType));
				}
			};
			
			if (seed instanceof ExplicitParallel)
			{
				storeKeywordsOf(seed);
			}
			else if (seed instanceof ImplicitParallel)
			{
				const queue: ImplicitParallel[] = [seed];
				
				for (let i = -1; ++i < queue.length;)
				{
					const current = queue[i];
					
					for (const parallel of current.getParallels())
					{
						if (parallel instanceof ExplicitParallel)
							storeKeywordsOf(parallel);
						
						else if (parallel instanceof ImplicitParallel)
							queue.push(parallel);
					}
				}
			}
			
			return this._keywords = keywords;
		}
		private _keywords: readonly Keyword[] | null = null;
		
		/**
		 * Gets a string representing any alias associated with the Type,
		 * or an empty string in the case when there is no associated alias.
		 */
		get alias(): string
		{
			if (this.keywords.length === 0)
				return "";
			
			for (const kw of this.keywords)
				if (kw.isAlias)
					return kw.word;
			
			return "";
		}
		
		/**
		 * Attempts to extract a "capture" value from the alias defined
		 * on this Type. 
		 * 
		 * Returns an empty string in the cases when
		 * - This Type has no associated alias.
		 * - There were no capture groups defined in the supporting Pattern.
		 * - The specified position is greater than the number of captures
		 * defined in the supporting Pattern.
		 */
		capture(position: number): string
		{
			if (position < 1)
				throw Exception.invalidArgument();
			
			const alias = this.alias;
			if (alias === "")
				return "";
			
			for (const kw of this.keywords)
			{
				if (!kw.isAlias || 
					!(kw.type.seed instanceof ExplicitParallel) ||
					kw.type.seed.pattern === null)
					continue;
				
				const pattern = kw.type.seed.pattern;
				const captures = pattern.capture(kw.word);
				return position < captures.length ? captures[position] : "";
			}
			
			return "";
		}
		
		/**
		 * Gets a string representation of the entire annotation side of this Type.
		 */
		get sum()
		{
			if (this._sum !== null)
				return this._sum;
			
			return this._sum = this.keywords
				.map(({ word }) => word)
				.join(Syntax.combinator + " ");
		}
		private _sum: string | null = null;
		
		/** */
		get isOverride() { return this.supervisors.length > 0; }
		
		/** */
		get isIntroduction() { return this.supervisors.length === 0; }
		
		/**
		 * Gets whether this Type is a _refinement_, which means that
		 * it's name is also the name of one of the base Types defined 
		 * directly on it.
		 */
		get isRefinement() { return (this.flags & Flags.isRefinement) === Flags.isRefinement; }
		
		/**
		 * Gets whether this Type represents the intrinsic side of a list.
		 */
		get isListIntrinsic() { return (this.flags & Flags.isListIntrinsic) === Flags.isListIntrinsic; }
		
		/**
		 * Gets whether this Type represents the extrinsic side of a list.
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
		
		/** Gets whether this Type is anonymous (unnamed). */
		get isAnonymous() { return (this.flags & Flags.isAnonymous) === Flags.isAnonymous; }
		
		/** Gets whether this Type represents a pattern. */
		get isPattern() { return (this.flags & Flags.isPattern) === Flags.isPattern; }
		
		/** */
		get isUri() { return (this.flags & Flags.isUri) === Flags.isUri; }
		
		private flags = 0;
		
		/**
		 * Performs an arbitrary recursive, breadth-first traversal
		 * that begins at this Type instance. Ensures that Types are
		 * not yielded multiple times.
		 * 
		 * @param nextFn A function that returns a Type, or an
		 * iterable of Types that are to be visited next.
		 * @param reverse An optional boolean value that indicates
		 * whether Types in the returned array should be sorted
		 * with the most deeply visited nodes occuring first.
		 * 
		 * @returns An array that stores the list of Types that were
		 * visited.
		 */
		visit(nextFn: (type: Type) => Iterable<Type | null> | Type | null, reverse?: boolean)
		{
			return Array.from(this.iterate(nextFn, reverse)).map(entry => entry.type);
		}
		
		/**
		 * Performs an arbitrary recursive, breadth-first iteration
		 * that begins at this Type instance. Ensures that no Types
		 * Types are yielded multiple times.
		 * 
		 * @param nextFn A function that returns a type, or an iterable
		 * of Types that are to be visited next.
		 * @param reverse An optional boolean value that indicates
		 * whether the iterator should yield Types starting with the
		 * most deeply nested objects first.
		 * 
		 * @yields An object that contains a `type` property that is the
		 * the Type being visited, and a `via` property that is the Type
		 * that was returned in the previous call to `nextFn`.
		 */
		*iterate(
			nextFn: (type: Type) => Iterable<Type | null> | Type | null,
			reverse?: boolean)
		{
			const yielded: Type[] = [];
			const via: Type[] = [];
			
			type RecurseType = IterableIterator<{ type: Type; via: Type[]; }>;
			function *recurse(type: Type): RecurseType
			{
				if (yielded.includes(type))
					return;
				
				if (!reverse)
				{
					yielded.push(type);
					yield { type, via };
				}
				
				via.push(type);
				
				const reduced = nextFn(type);
				if (reduced !== null && reduced !== undefined)
				{
					if (reduced instanceof Type)
						return yield *recurse(reduced);
					
					for (const nextType of reduced)
						if (nextType instanceof Type)
							yield *recurse(nextType);
				}
				
				via.pop();
				
				if (reverse)
				{
					yielded.push(type);
					yield { type, via };
				}
			}
			
			yield *recurse(this);
		}
		
		/**
		 * Queries for a Type that is submerged within this Type,
		 * at the specified type path.
		 */
		query(...typePath: string[])
		{
			let currentType: Type | null = null;
			
			for (const typeName of typePath)
			{
				const nextType = this.containees.find(t => t.name === typeName);
				if (!nextType)
					break;
				
				currentType = nextType;
			}
			
			return currentType;
		}
		
		/**
		 * Checks whether this Type has the specified Type
		 * somewhere in it's base graph.
		 */
		is(baseType: Type)
		{
			for (const { type } of this.iterate(t => t.supers))
				if (type === baseType)
					return true;
			
			return false;
		}
		
		/**
		 * Checks whether the specified Type is in this Type's
		 * `.containees` property, either directly, or indirectly via
		 * the parallel graphs of the `.containees` Types.
		 */
		has(type: Type)
		{
			if (this.containees.includes(type))
				return true;
			
			for (const innerType of this.containees)
				if (type.name === innerType.name)
					for (const parallel of innerType.iterate(t => t.supervisors))
						if (parallel.type === type)
							return true;
			
			return false;
		}
		
		/**
		 * Returns a reference to the trait function that corresponds
		 * to the specified trait definition, or null in the case when this
		 * Type does not have a trait function that corresponds to the
		 * definition specified.
		 * 
		 * Currently, the calling behavior is non-polymorphic. When
		 * calling the trait function returned, a single call is made to
		 * the first instance of the definition of the trait in the Type's
		 * super graph.
		 */
		call<T extends TraitDefinition>(def: T): null | TraitEntryPoint<T>
		{
			let implFunction: Function | null = null;
			
			for (const type of this.visit(t => t.supers))
			{
				const traits = type.statements[0].traits;
				if (!traits)
					continue;
				
				for (const trait of traits)
				{
					if (trait.definition === def)
					{
						implFunction = trait.implementation;
						break;
					}
				}
			}
			
			if (implFunction === null)
				return null;
			
			return implFunction as any;
		}
		
		/**
		 * Returns a string representation of this Type, suitable for
		 * debugging purposes.
		 */
		toString(kind: "path" | "full" = "path")
		{
			if ("DEBUG" && kind === "full")
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
				write(".supers", this.supers);
				write(".supervisors", this.supervisors);
				write(".adjacents", this.adjacents);
				write(".patterns", this.patterns);
				write(".alias", [this.alias]);
				
				lines.shift();
				return lines.join("\n");
			}
			
			return this.phrase.toString();
		}
		
		/**
		 * Ensures that the Type has been constructed.
		 * Returns the Parallel assigned to this Type's .seed property,
		 * but in a non-null format.
		 */
		private guard()
		{
			if (!this.seed)
				Type.construct(this.phrase);
			
			if (!this.seed)
				throw Exception.unknownState();
			
			return this.seed;
		}
	}
	
	/**
	 * An object that represents either an explicit or implicit 
	 * annotation on a Type. The annotation may either be a
	 * literal Type name, or it may be an alias.
	 */
	export class Keyword
	{
		constructor(
			/**
			 * Stores the raw text string of the Keyword, regardless of
			 * whether it represents an alias or a literal Type.
			 */
			readonly word: string,
			/**
			 * Stores the Type associated with the Keyword.
			 * 
			 * In the case when this Keyword refers to a literal Type, this
			 * property contains a reference to that Type.
			 * 
			 * In the case when this Keyword is an alias, this property will
			 * refer to the Pattern type that supports the Keyword.
			 */
			readonly type: Type) { }
		
		/**
		 * Gets whether the .word property stores an alias.
		 */
		get isAlias()
		{
			return this.type.isPattern;
		}
	}
	
	/**
	 * Recursively searches the parallel graph of the specified explicit or 
	 * implicit parallel object, and returns the Type objects that form the
	 * array of supervising Types that corresponds to the seed parallel
	 * specified.
	 */
	function findSupervisors(seed: Parallel)
	{
		const ids = new Set<number>();
		const supervisors: Type[] = [];
		
		const recurse = (currentParallel: Parallel) =>
		{
			if (currentParallel instanceof ImplicitParallel)
			{
				for (const nestedParallel of currentParallel.getParallels())
					recurse(nestedParallel);
			}
			else if (currentParallel instanceof ExplicitParallel)
			{
				if (ids.has(currentParallel.id))
					return;
				
				ids.add(currentParallel.id);
				
				const type = Type.construct(currentParallel.phrase);
				if (type)
					supervisors.push(type);
			}
		};
		
		for (const parallel of seed.getParallels())
			recurse(parallel);
		
		return supervisors;
	}
	
	/** */
	const enum Flags
	{
		isListIntrinsic = 1,
		isListExtrinsic = 2,
		isFresh = 4,
		isExplicit = 8,
		isAnonymous = 16,
		isPattern = 32,
		isUri = 64,
		isRefinement = 128
	}
}
