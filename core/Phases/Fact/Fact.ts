
namespace Truth
{
	/**
	 * A class that represents a fully constructed Fact within the program.
	 */
	export class Fact extends AbstractClass
	{
		/** 
		 * @internal
		 * Constructs one or more Fact objects from the specified location.
		 */
		static construct(phrase: Phrase): Fact | null
		{
			if (!phrase || phrase.length === 0)
				return null;
			
			// If the cached fact exists, but hasn't been compiled yet,
			// we can't return it, we need to compile it first.
			const existingFact = this.fromPhrase(phrase);
			if (existingFact.seed)
				return existingFact;
			
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
			
			let lastFact: Fact | null = null;
			
			for (const seed of parallelContainment)
			{
				const fact = this.fromPhrase(seed.phrase);
				if (fact.seed)
				{
					lastFact = fact;
					continue;
				}
				
				// Warning to developers running the debuggers:
				// This area of the function can cause recursion,
				// feeding back into this method.
				
				fact.seed = seed;
				fact._container = lastFact;
				
				// Optimization: surface-level facts do not have supervisors
				if (lastFact)
					fact._supervisors = findSupervisors(seed);
				
				if (seed instanceof ExplicitParallel)
				{
					fact._supers = this.basesOf(seed);
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
					
					fact._supers = explicitParallels
						.map(par => this.basesOf(par))
						.reduce((a, b) => a.concat(b), [])
						.filter((v, i, a) => a.indexOf(v) === i);
				}
				else throw Exception.unknownState();
				
				if (seed instanceof ExplicitParallel)
				{
					const sub = seed.phrase.terminal;
					
					if (sub instanceof Pattern)
						fact.flags |= Flags.isPattern;
					
					else if (sub instanceof KnownUri)
						fact.flags |= Flags.isUri;
					
					else if (sub === Term.anonymous)
						fact.flags |= Flags.isAnonymous;
					
					if (seed.getParallels().length === 0)
						fact.flags |= Flags.isFresh;
					
					fact.flags |= Flags.isExplicit;
				}
				
				if (fact.keywords.some(key => key.word === fact.name))
					fact.flags |= Flags.isRefinement;
				
				const volatile = fact.document.isVolatile;
				
				for (const sup of fact._supers)
				{
					if (sup.document === fact.document)
						sup.subsLocal.push(fact);
					
					else if (!volatile)
						program.setForeignSuper(sup, fact);
				}
				
				for (const supervisor of fact._supervisors)
				{
					if (supervisor.document === fact.document)
						supervisor.subvisorsLocal.push(fact);
					
					else if (!volatile)
						program.setForeignSupervisor(supervisor, fact);
				}
				
				program.addFact(fact, phrase.id);
				lastFact = fact;
			}
			
			return lastFact;
		}
		
		/** */
		private static basesOf(ep: ExplicitParallel)
		{
			const bases = Array.from(ep.eachBase());
			return bases.map(entry => Fact.fromPhrase(entry.base.phrase));
		}
		
		/**
		 * Returns the Fact object that corresponds to the specified phrase,
		 * or constructs a new fact when no corresponding phrase object
		 * could be found.
		 */
		private static fromPhrase(phrase: Phrase)
		{
			const doc = phrase.containingDocument;
			const existing = doc.program.getFact(doc, phrase.id);
			if (existing)
				return existing;
			
			const fact = new Fact(phrase);
			doc.program.addFact(fact, phrase.id);
			return fact;
		}
		
		/** */
		private constructor(phrase: Phrase)
		{
			super();
			this.name = phrase.terminal.toString();
			this.phrase = phrase;
		}
		
		/** @internal */
		readonly class = Class.fact;
		
		/**
		 * Stores a text representation of the name of the Fact,
		 * or a serialized version of the pattern content in the
		 * case when the Fact is actually a pattern.
		 */
		readonly name: string;
		
		/**
		 * Stores the phrase that specifies where this Fact was
		 * found in the document.
		 */
		private readonly phrase: Phrase;
		
		/**
		 * Stores the seed Parallel that is the primary source of information
		 * for the construction of this Fact. In the case when this field is null,
		 * it can be assumed that the Fact has not been compiled.
		 */
		private seed: Parallel | null = null;
		
		/**
		 * Gets the document in which this Fact is defined.
		 */
		get document()
		{
			return this.phrase.containingDocument;
		}
		
		/**
		 * Gets an array of Statement objects that are responsible
		 * for the initiation of this Fact. In the case when this Fact
		 * object represents a path that is implicitly defined, the
		 * array is empty. For example, given the following document:
		 * 
		 * ```
		 * Class
		 * 	Field
		 * SubClass : Class
		 * ```
		 * 
		 * The Fact at path SubClass/Field is an implicit Fact, and
		 * therefore, although a valid Fact object, has no phyisical
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
		 * Gets the level of containment of this Fact. 
		 * Facts defined at the top of a document have a level of 1.
		 */
		get level()
		{
			return this.phrase.length;
		}
		
		/**
		 * Gets the Fact that contains this Fact, or null in
		 * the case when this Fact is surface-level.
		 */
		get container(): Fact | null
		{
			this.guard();
			return this._container;
		}
		private _container: Fact | null = null;
		
		/**
		 * Gets the array of Facts that are contained directly by this
		 * one. In the case when this Fact is a list, the array does
		 * not include the list's intrinsic Facts.
		 */
		get containees()
		{
			if (this._containees !== null)
				return this._containees;
			
			const seed = this.guard();
			const phrases = this.phrase.containingDocument.program.phrases;
			const innerSubjects = new Set<Subject>();
			
			// Dig through the parallel graph recursively, and at each parallel,
			// dig through the base graph recursively, and collect all the names
			// that are found.
			for (const { fact: parallelFact } of this.iterate(f => f.supervisors, true))
			{
				for (const { fact: superFact } of parallelFact.iterate(f => f.supers, true))
				{
					// superFact should always be seeded, however these checks
					// are in place to guard against any possibility of this not being
					// the case.
					let sup: Fact | null = superFact;
					if (!sup.seed)
						sup = Fact.construct(superFact.phrase);
					
					if (!sup)
						continue;
					
					if (superFact.seed instanceof ExplicitParallel)
						for (const subject of phrases.peekSubjects(superFact.seed))
							innerSubjects.add(subject);
				}
			}
			
			const innerFacts = Array.from(innerSubjects)
				.flatMap(subject => phrases.forward(seed, subject))
				.map(phrase => Fact.construct(phrase))
				.filter((t): t is Fact => t !== null);
			
			return this._containees = Object.freeze(innerFacts);
		}
		private _containees: readonly Fact[] | null = null;
		
		/**
		 * Gets the array of Facts that are contained directly by this
		 * one. In the case when this Fact is not a list, the array
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
		private _containeesIntrinsic: readonly Fact[] | null = null;
		
		/**
		 * Gets the array of Facts from which this Fact extends.
		 * If this Fact extends from a pattern, it is included in this
		 * array.
		 */
		get supers(): readonly Fact[]
		{
			this.guard();
			return this._supers;
		}
		private _supers: readonly Fact[] = [];
		
		/**
		 * Gets the array of Facts that extend from this one, either
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
			for (const sub of p.getForeignFactsReferencingFactAsSuper(this))
				yield sub;
		}
		private readonly subsLocal: Fact[] = [];
		
		/**
		 * Gets a reference to the parallel roots of this Fact.
		 * The parallel roots are the endpoints found when
		 * traversing upward through the parallel graph.
		 */
		get chiefs()
		{
			if (this._chiefs !== null)
				return this._chiefs;
			
			this.guard();
			
			const chiefs: Fact[] = [];
			for (const { fact } of this.iterate(f => f.supervisors))
				if (fact !== this && fact.supervisors.length === 0)
					chiefs.push(fact);
			
			return this._chiefs = Object.freeze(chiefs);
		}
		private _chiefs: readonly Fact[] | null = null;
		
		/**
		 * Gets a reference to the Fact, as it's defined in it's
		 * next most applicable Fact.
		 */
		get supervisors()
		{
			this.guard();
			return this._supervisors;
		}
		private _supervisors: readonly Fact[] = [];
		
		/**
		 * Gets the array of Facts that have this Fact as a supervisor.
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
			for (const sub of p.getForeignFactsReferencingFactAsSupervisor(this))
				yield sub;
		}
		private readonly subvisorsLocal: Fact[] = [];
		
		/**
		 * Gets an array that contains the Facts that share the same 
		 * containing Fact (as represented in the .container property)
		 * as this one.
		 */
		get adjacents()
		{
			if (this._adjacents !== null)
				return this._adjacents;
			
			this.guard();
			
			if (this.container)
				return this._adjacents = this.container.containees.filter(f => f !== this);
			
			const document = this.phrase.containingDocument;
			const roots = Array.from(Phrase.rootsOf(document));
			
			const adjacents = roots
				.map(phrase => Fact.construct(phrase))
				.filter((f): f is Fact => f !== null && f !== this);
			
			return this._adjacents = Object.freeze(adjacents);
		}
		private _adjacents: readonly Fact[] | null = null;
		
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
		private _superordinates: readonly Fact[] | null = null;
		
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
		private _subordinates: readonly Fact[] | null = null;
		
		/**
		 * Gets an array that contains the patterns that resolve to this Fact.
		 */
		get patterns()
		{
			if (this._patterns !== null)
				return this._patterns;
			
			// Stores a map whose keys are a concatenation of the Uris of all
			// the bases that are matched by a particular pattern, and whose
			// values are the Fact object containing that pattern. This map
			// provides an easy way to determine if there is already a pattern
			// that matches a particular set of Facts in scope.
			const patternMap = new Map<string, Fact>();
			
			for (const { fact } of this.iterate(f => f.container))
			{
				const applicablePatternFacts = fact.adjacents
					.filter(f => f.isPattern)
					.filter(f => f.supers.includes(fact));
				
				const applicablePatternsBasesLabels =
					applicablePatternFacts.map(p => p.supers
						.map(b => b.phrase.toString())
						.join(Syntax.terminal));
				
				for (let i = -1; ++i < applicablePatternFacts.length;)
				{
					const baseLabel = applicablePatternsBasesLabels[i];
					if (!patternMap.has(baseLabel))
						patternMap.set(baseLabel, applicablePatternFacts[i]);
				}
			}
			
			const out = Array.from(patternMap.values());
			return this._patterns = Object.freeze(out);
		}
		private _patterns: readonly Fact[] | null = null;
		
		/**
		 * Gets an array that contains the raw string values representing
		 * the aliases with which this Fact has been annotated.
		 * 
		 * If this Fact is implicit, the parallel graph is searched, and any
		 * applicable aliases will be present in the returned array.
		 */
		get aliases()
		{
			if (this._aliases !== null)
				return this._aliases;
			
			const aliases: string[] = [];
			const seed = this.guard();
			
			const extractAlias = (ep: ExplicitParallel) =>
			{
				for (const { alias } of ep.eachBase())
					if (alias)
						aliases.push(alias);
			};
			
			if (seed instanceof ExplicitParallel)
			{
				extractAlias(seed);
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
		 * Gets a table of information aobut the keywords that are 
		 * associated with this Fact, in the order in which they occur
		 * within the document.
		 */
		get keywords()
		{
			if (this._keywords !== null)
				return this._keywords;
			
			const keywords: Keyword[] = [];
			const seed = this.guard();
			
			const extractFact = (ep: ExplicitParallel) =>
			{
				for (const { base, fork, alias } of ep.eachBase())
				{
					const word = fork?.term.toString() || alias;
					const baseFact = Fact.construct(base.phrase);
					if (baseFact)
						keywords.push(new Keyword(word, baseFact));
				}
			};
			
			if (seed instanceof ExplicitParallel)
			{
				extractFact(seed);
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
							extractFact(parallel);
						
						else if (parallel instanceof ImplicitParallel)
							queue.push(parallel);
					}
				}
			}
			
			return this._keywords = keywords;
		}
		private _keywords: readonly Keyword[] | null = null;
		
		/**
		 * Gets a string representation of the entire annotation side of this Fact.
		 */
		get value()
		{
			if (this._value !== null)
				return this._value;
			
			return this._value = this.keywords
				.map(({ word }) => word)
				.join(Syntax.combinator + " ");
		}
		private _value: string | null = null;
		
		/** */
		get isOverride() { return this.supervisors.length > 0; }
		
		/** */
		get isIntroduction() { return this.supervisors.length === 0; }
		
		/**
		 * Gets whether this Fact is a _refinement_, which means that
		 * it's name is also the name of one of the base Facts defined 
		 * directly on it.
		 */
		get isRefinement() { return (this.flags & Flags.isRefinement) === Flags.isRefinement; }
		
		/**
		 * Gets whether this Fact represents the intrinsic side of a list.
		 */
		get isListIntrinsic() { return (this.flags & Flags.isListIntrinsic) === Flags.isListIntrinsic; }
		
		/**
		 * Gets whether this Fact represents the extrinsic side of a list.
		 */
		get isListExtrinsic() { return (this.flags & Flags.isListExtrinsic) === Flags.isListExtrinsic; }
		
		/**
		 * Gets whether this Fact instance has no annotations applied to it.
		 */
		get isFresh() { return (this.flags & Flags.isFresh) === Flags.isFresh; }
		
		/**
		 * Gets whether this Fact was directly specified in the document,
		 * or if it's existence was inferred.
		 */
		get isExplicit() { return (this.flags & Flags.isExplicit) === Flags.isExplicit; }
		
		/** Gets whether this Fact is anonymous (unnamed). */
		get isAnonymous() { return (this.flags & Flags.isAnonymous) === Flags.isAnonymous; }
		
		/** Gets whether this Fact represents a pattern. */
		get isPattern() { return (this.flags & Flags.isPattern) === Flags.isPattern; }
		
		/** */
		get isUri() { return (this.flags & Flags.isUri) === Flags.isUri; }
		
		private flags = 0;
		
		/**
		 * Performs an arbitrary recursive, breadth-first traversal
		 * that begins at this Fact instance. Ensures that Facts are
		 * not yielded multiple times.
		 * 
		 * @param nextFn A function that returns a Fact, or an
		 * iterable of Facts that are to be visited next.
		 * @param reverse An optional boolean value that indicates
		 * whether Facts in the returned array should be sorted
		 * with the most deeply visited nodes occuring first.
		 * 
		 * @returns An array that stores the list of Facts that were
		 * visited.
		 */
		visit(nextFn: (fact: Fact) => Iterable<Fact | null> | Fact | null, reverse?: boolean)
		{
			return Array.from(this.iterate(nextFn, reverse)).map(entry => entry.fact);
		}
		
		/**
		 * Performs an arbitrary recursive, breadth-first iteration
		 * that begins at this Fact instance. Ensures that no Facts
		 * Facts are yielded multiple times.
		 * 
		 * @param nextFn A function that returns a fact, or an iterable
		 * of Facts that are to be visited next.
		 * @param reverse An optional boolean value that indicates
		 * whether the iterator should yield Facts starting with the
		 * most deeply nested objects first.
		 * 
		 * @yields An object that contains a `fact` property that is the
		 * the Fact being visited, and a `via` property that is the Fact
		 * that was returned in the previous call to `nextFn`.
		 */
		*iterate(
			nextFn: (fact: Fact) => Iterable<Fact | null> | Fact | null,
			reverse?: boolean)
		{
			const yielded: Fact[] = [];
			const via: Fact[] = [];
			
			type RecurseType = IterableIterator<{ fact: Fact; via: Fact[]; }>;
			function *recurse(fact: Fact): RecurseType
			{
				if (yielded.includes(fact))
					return;
				
				if (!reverse)
				{
					yielded.push(fact);
					yield { fact, via };
				}
				
				via.push(fact);
				
				const reduced = nextFn(fact);
				if (reduced !== null && reduced !== undefined)
				{
					if (reduced instanceof Fact)
						return yield *recurse(reduced);
					
					for (const nextFact of reduced)
						if (nextFact instanceof Fact)
							yield *recurse(nextFact);
				}
				
				via.pop();
				
				if (reverse)
				{
					yielded.push(fact);
					yield { fact, via };
				}
			}
			
			yield *recurse(this);
		}
		
		/**
		 * Queries for a Fact that is submerged within this Fact,
		 * at the specified fact path.
		 */
		query(...factPath: string[])
		{
			let currentFact: Fact | null = null;
			
			for (const factName of factPath)
			{
				const nextFact = this.containees.find(f => f.name === factName);
				if (!nextFact)
					break;
				
				currentFact = nextFact;
			}
			
			return currentFact;
		}
		
		/**
		 * Checks whether this Fact has the specified Fact
		 * somewhere in it's base graph.
		 */
		is(baseFact: Fact)
		{
			for (const { fact } of this.iterate(f => f.supers))
				if (fact === baseFact)
					return true;
			
			return false;
		}
		
		/**
		 * Checks whether the specified Fact is in this Fact's
		 * `.containees` property, either directly, or indirectly via
		 * the parallel graphs of the `.containees` Facts.
		 */
		has(fact: Fact)
		{
			if (this.containees.includes(fact))
				return true;
			
			for (const innerFact of this.containees)
				if (fact.name === innerFact.name)
					for (const parallel of innerFact.iterate(f => f.supervisors))
						if (parallel.fact === fact)
							return true;
			
			return false;
		}
		
		/**
		 * Recursively invokes any fold() method provided by
		 * computed Facts submerged within this Fact.
		 */
		fold()
		{
			throw Exception.notImplemented();
		}
		
		/**
		 * Returns a string representation of this Fact, suitable for
		 * debugging purposes.
		 */
		toString(kind: "path" | "full" = "path")
		{
			if ("DEBUG" && kind === "full")
			{
				const lines: string[] = [];
				const write = (
					group: string,
					values: readonly Fact[] | readonly Phrase[] | readonly string[]) =>
				{
					lines.push("");
					lines.push(group);
					
					for (const value of values)
					{
						const textValue = 
							value instanceof Fact ? value.phrase.toString() :
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
				write(".aliases", this.aliases);
				
				lines.shift();
				return lines.join("\n");
			}
			
			return this.phrase.toString();
		}
		
		/**
		 * Ensures that the Fact has been constructed.
		 * Returns the Parallel assigned to this Fact's .seed property,
		 * but in a non-null format.
		 */
		private guard()
		{
			if (!this.seed)
				Fact.construct(this.phrase);
			
			if (!this.seed)
				throw Exception.unknownState();
			
			return this.seed;
		}
	}
	
	/**
	 * An object that represents either an explicit or implicit 
	 * annotation on a Fact. The annotation may either be a
	 * literal Fact name, or it may be an alias.
	 */
	export class Keyword
	{
		constructor(
			readonly word: string,
			readonly fact: Fact) { }
		
		/**
		 * Gets whether the .word property stores an alias.
		 */
		get isAlias()
		{
			return this.fact.name === this.word;
		}
	}
	
	/**
	 * Recursively searches the parallel graph of the specified explicit or 
	 * implicit parallel object, and returns the Fact objects that form the
	 * array of supervising Facts that corresponds to the seed parallel
	 * specified.
	 */
	function findSupervisors(seed: Parallel)
	{
		const ids = new Set<number>();
		const supervisors: Fact[] = [];
		
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
				
				const fact = Fact.construct(currentParallel.phrase);
				if (fact)
					supervisors.push(fact);
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
