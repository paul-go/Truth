
namespace Truth
{
	/**
	 * 
	 */
	export class ExplicitParallel extends Parallel
	{
		/**
		 * @internal
		 * Invoked by ParallelCache. Do not call.
		 */
		constructor(
			phrase: Phrase,
			container: ExplicitParallel | null,
			cruft: CruftCache)
		{
			super(phrase, container);
			
			if (phrase.isHypothetical)
				throw Exception.unknownState();
			
			this.cruft = cruft;
			phrase.containingDocument.program.faults.inform(phrase);
		}
		
		/** */
		private readonly cruft: CruftCache;
		
		/**
		 * Gets the first base contained by this instance.
		 * @throws In the case when this instance contains no bases.
		 */
		get firstBase()
		{
			for (const baseEntry of this._bases.values())
				return baseEntry.parallels[0];
			
			throw Exception.unknownState();
		}
		
		/**
		 * Performs a shallow traversal on the non-cruft bases
		 * defined directly on this ExplicitParallel.
		 */
		*eachBase()
		{
			for (const [fork, baseEntry] of this._bases)
				if (!this.cruft.has(fork))
					for (const base of baseEntry.parallels)
						yield { base, fork, aliased: baseEntry.aliased };
		}
		private readonly _bases = new Map<Fork, IBaseEntry>();
		
		/**
		 * 
		 */
		private addBaseEntry(
			base: ExplicitParallel,
			fork: Fork,
			aliased: boolean)
		{
			const existing = this._bases.get(fork);
			if (existing)
				existing.parallels.push(base);
			else
				this._bases.set(fork, { parallels: [base], aliased });
		}
		
		/**
		 * Performs a deep traversal on the graph of non-cruft bases
		 * that are connected to this ExplicitParallel.
		 */
		*eachBaseDeep()
		{
			const queue = Array.from(this.eachBase()).map(e => e.base);
			
			for (let i = -1; ++i < queue.length;)
			{
				const current = queue[i];
				yield current;
				
				for (const { base } of current.eachBase())
					if (!queue.includes(base))
						queue.push(base);
			}
		}
		
		/**
		 * @returns A boolean value that indicates whether the provided
		 * ExplicitParallel instance exists somewhere, possibly nested,
		 * in the base graph of this instance.
		 */
		hasBase(testBase: ExplicitParallel)
		{
			const queue = Array.from(this.eachBase()).map(e => e.base);
			
			for (let i = -1; ++i < queue.length;)
			{
				const current = queue[i];
				if (current === testBase)
					return true;
				
				for (const { base } of current.eachBase())
					if (!queue.includes(base))
						queue.push(base);
			}
			
			return false;
		}
		
		/**
		 * Attempts to add the provided ExplicitParallel as a base of
		 * this instance. If the addition of the new base would not generate
		 * any critical faults, it is added. Otherwise, it's marked as cruft.
		 * 
		 * The method also attempts to satisfy one or more conditions of 
		 * the contract, by computing whether the input ExplicitParallel 
		 * is a more derived type of any of the ExplicitParallels referenced
		 * in this ExplicitParallel's contract.
		 * 
		 * @returns A boolean value that indicates whether the base
		 * was added successfully.
		 */
		tryAddLiteralBase(base: ExplicitParallel, via: Fork)
		{
			if (this._bases.has(via))
				throw Exception.unknownState();
			
			// Just as a reminder -- pattern-containing parallels 
			// don't come into this method. Bases are applied to
			// patterns in tryApplyPatternBases.
			if (this.pattern)
				throw Exception.unknownState();
			
			let numSatisfied = 0;
			const unsatisfiedConditions = this.contractConditionsUnsatisfied;
			const collectBaseGraphRecursive = (currentParallel: ExplicitParallel) =>
			{
				if (unsatisfiedConditions.size === 0)
					return;
				
				const madeProgress = unsatisfiedConditions.delete(currentParallel);
				if (madeProgress)
					// It is important to only continue to dig further into the base graph 
					// if the parallel that was used to attempt to satisfy a condition didn't
					// satisfy anything. 
					return void numSatisfied++;
				
				if (unsatisfiedConditions.size === 0)
					return;
				
				for (const { base } of currentParallel.eachBase())
					collectBaseGraphRecursive(base);
			}
			
			collectBaseGraphRecursive(base);
			
			// Was anything in the contract actually satisfied?
			if (numSatisfied === 0 && this.contractConditions.size > 0)
				return false;
			
			const sanitizer = new Sanitizer(this, base, via, this.cruft);
			
			// In this case, we only need to do a 
			// shallow check for circular inheritance.
			if (sanitizer.detectCircularReferences())
				return false;
			
			if (sanitizer.detectListFragmentConflicts())
				return false;
			
			if (this.baseCount > 0)
				if (sanitizer.detectListDimensionalityConflict())
					return false;
			
			this.addBaseEntry(base, via, false);
			return true;
		}
		
		/**
		 * Attempts to indirectly apply a base to this ExplicitParallel via an alias
		 * and a fork.
		 * 
		 * @param patternParallelsInScope A set that contains all the pattern
		 * containing ExplicitParallels that are visible to this ExplicitParallel. The
		 * array is expected to be sorted in the order of priority, meaning that
		 * items that correspond to patterns defined in the same scope as this
		 * ExplicitParallel will be sorted higher than item that correspond to
		 * patterns defined in higher-level scopes.
		 * 
		 * @param viaFork The Fork in which the alias was found.
		 * 
		 * @param viaAlias The string to test against the parallel embedded
		 * within patternParallelsInScope.
		 * 
		 * @returns A boolean value that indicates whether a base was added
		 * successfully.
		 */
		tryAddAliasedBase(
			patternParallelsInScope: ReadonlySet<ExplicitParallel>,
			viaFork: Fork,
			viaAlias: string)
		{
			if (this._bases.has(viaFork))
				throw Exception.unknownState();
			
			// Just as a reminder -- pattern-containing parallels don't come
			// into this method–only the ones with aliases that might match them.
			if (this.pattern)
				throw Exception.unknownState();
			
			if (this.contractConditionsUnsatisfied.size > 0)
			{
				const applicablePatternParallels = new Set<ExplicitParallel>();
				
				// Stores the set of all bases (deep) that exist within the contract
				const contractBases = new Set<ExplicitParallel>();
				for (const contractPar of this.contractConditionsUnsatisfied)
				{
					contractBases.add(contractPar);
					for (const contractParDeep of contractPar.eachBaseDeep())
						contractBases.add(contractParDeep);
				}
				
				// This loop attempts to discover the pattern-containing parallels
				// from the patternParallelsInScope array that match one or more
				// bases defined in the contract of this ExplicitParallel, but without 
				// having a base that is not imposed by this ExplicitParallel's contract. 
				// For example, if this ExplicitParallel's contract required bases A, B,
				// and C, and one pattern where to match A and B, and another pattern
				// were to match A, B, C, and D, this loop would discover the first pattern,
				// as the second one would be disqualified.
				for (const patternParallel of patternParallelsInScope)
				{
					const patternBases = new Set<ExplicitParallel>();
					for (const { base } of patternParallel.eachBase())
						patternBases.add(base);
					
					if (Misc.isSubset(contractBases, patternBases))
						applicablePatternParallels.add(patternParallel);
				}
				
				// Can't add an aliased base, because no applicable patterns 
				// are in scope.
				if (applicablePatternParallels.size === 0)
					return false;
				
				// In order to add an aliased base, the alias has to match
				// all matching patterns in scope.
				
				const infixedPatternParallels: ExplicitParallel[] = [];
				const nonInfixedPatternParallels: ExplicitParallel[] = [];
				
				// If any of the patterns discovered have portability infixes, these need
				// to be validated first, and so the applicablePatternParallels set needs
				// to be divided up into two arrays.
				// The basic idea is to feed the alias into these patterns, extract out the
				// infixed areas out of the value, and then this extracted value would
				// form a new alias that could be fed into other patterns. This at least
				// would work for portability infixes. Population infixes may require
				// some other handling. (Right now this clearly isn't implemented)
				for (const patternParallel of applicablePatternParallels)
				{
					const pattern = Not.null(patternParallel.pattern);
					pattern.hasInfixes() ?
						infixedPatternParallels.push(patternParallel) :
						nonInfixedPatternParallels.push(patternParallel);
				}
				
				if (infixedPatternParallels.length > 0)
					throw Exception.notImplemented();
				
				for (const patternParallel of nonInfixedPatternParallels)
				{
					const pattern = Not.null(patternParallel.pattern);
					if (!pattern.test(viaAlias))
						return false;
				}
				
				// If we have gotten to this point, the contract is considered to be satisfied
				// entirely. This may seem like a cheat–but it's not. We're actually able to
				// just add all the parallels being imposed as bases, and then declare the 
				// contract as settled. (There may be some other work to do here because
				// this doesn't include the pattern parallel in the set of bases. Maybe this
				// is what we want though? Use of patterns isn't supposed to influence
				// other contracts.)
				for (const parallel of this.contractConditionsUnsatisfied)
					this.addBaseEntry(parallel, viaFork, true);
				
				this.contractConditionsUnsatisfied.clear();
				return true;
			}
			// In the case when the contract had conditions, but they have
			// all been met, further aliases are considered to be faults.
			// This method should probably return this information specifically
			// instead of just sending back an ambiguous false value.
			else if (this.contractConditions.size > 0)
			{
				debugger;
				return false;
			}
			else
			{
				// This is the case when an alias is assigned to a type, but
				// no contract is being imposed on the type. This would be
				// most common for surface-level declarations that are
				// establishing things like global constants.
				debugger;
			}
		}
		
		/**
		 * Attempts to apply a set of bases to this ExplicitParallel,
		 * which must be a parallel that represents a pattern.
		 * 
		 * @example
		 * /pattern : This, Function, Adds, These
		 */
		tryAddBasesToPattern(baseTable: TBaseTable)
		{
			const bases = Array.from(baseTable.keys());
			
			// Non-Pattern nodes should never come to this method.
			if (!this.pattern)
				throw Exception.unknownState();
			
			const basesDeep = bases
				.map(b => Array.from(b.eachBaseDeep()))
				.reduce((a, b) => a.concat(b), [])
				.filter((v, i, a) => a.indexOf(v) === i);
			
			// Reminder: the ExplicitParallels in the basesDeep array
			// are expected to be fully processed by the time we get to
			// this method. It should be safe to touch them.
			
			if (basesDeep.length > 0)
			{
				const basesPhrases = bases.map(b => b.phrase);
				
				// Finds all pattern nodes that have a fork that points
				// to at least one of the bases in the basesDeep array.
				// This is to prepare for the comparison of pattern
				// subset and superset comparisons.
				
				/*
				TODO:
				
				Reimplementing this code requires a clearer understanding of:
				- Pattern homographs (can we have these?)
				- Is there a way how we can work around not having the inbounds?
				- How we could potentially find the "inbounds" in this case without
				having to resort to implementing these in the Phrases
				
				const basesDeepSprawl = basesDeep
					.map(b => Array.from(b.phrase.inbounds) as Fork[])
					.reduce((a, b) => a.concat(b), [])
					.map(inb => inb.predecessor)
					.filter((v, i, a) => a.indexOf(v) === i)
					.filter(phrase => phrase.terminal instanceof Pattern)
					.filter(phrase => phrase.outbounds
						.filter(obFork => obFork.successors.length === 0)
						.map(okFork => okFork.successors[0])
						.every(node => basesPhrases.includes(node)));
				
				const basesDeepSprawlPatterns = basesDeepSprawl
					.map(phrase => phrase.terminal)
					.filter((s): s is Pattern => s instanceof Pattern);
				*/
				
				// At this point, we need to test every single one of the 
				// patterns in basesDeepSprawlPatterns against this
				// this.phrase.terminal to make sure the two patterns
				// are compliant.
				// 
				// If they're not compliant, we need to start marking
				// bases as cruft until they are.
				// 
				// There is also a recursive infix embed process that
				// needs to happen here, but maybe we should just
				// put this off until the basic pattern functionality
				// is working?
			}
			
			// This also needs to take into account any other patterns
			// that are applied to any of the bases defined directly
			// inline.
			
			// Here we're just adding all the bases regardless of whether
			// or not any of the associated forks were marked as cruft.
			// The other enumerators skip over crufty forks, so this likely
			// isn't a problem, and it keeps it consistent with the way the
			// rest of the system works.
			for (const [base, via] of baseTable)
				this.addBaseEntry(base, via, false);
		}
		
		/**
		 * Gets the number of bases that have 
		 * been explicitly applied to this Parallel.
		 */
		get baseCount()
		{
			return this._bases.size;
		}
		
		/** */
		get intrinsicExtrinsicBridge()
		{
			return this._intrinsicExtrinsicBridge;
		}
		private _intrinsicExtrinsicBridge: ExplicitParallel | null = null;
		
		/**
		 * Establishes a bridge between this ExplicitParallel and the
		 * one provided. 
		 */
		createIntrinsicExtrinsicBridge(parallel: ExplicitParallel)
		{
			if (this._intrinsicExtrinsicBridge !== null)
				throw Exception.unknownState();
			
			if (parallel._intrinsicExtrinsicBridge !== null)
				throw Exception.unknownState();
			
			if (parallel.phrase.isListIntrinsic === this.phrase.isListIntrinsic)
				throw Exception.unknownState();
			
			this._intrinsicExtrinsicBridge = parallel;
			parallel._intrinsicExtrinsicBridge = this;
		}
		
		/** */
		getListDimensionality(): number
		{
			// NOTE: This actually needs to be "each base inferred"
			
			// This is purposely only returning the dimensionality of
			// the first base. There is a guarantee that all dimensionalities
			// will be the same here.
			for (const { base, fork } of this.eachBase())
			{
				const initialDim = base.getListDimensionality();
				return fork.term.isList ? initialDim + 1 : initialDim;
			}
			
			return 0;
		}
		
		/**
		 * 
		 */
		private comparePatternTo(other: ExplicitParallel)
		{
			
		}
		
		/**
		 * 
		 */
		private maybeCompilePattern()
		{
			///if (!this.pattern)
			///	return;
			
			///if (!pattern.hasInfixes())
			///	this.compiledExpression = pattern.
		}
		
		/**
		 * Gets the Pattern instance that resides inside this ExplicitParallel,
		 * or null in the case when this ExplicitParallel does not have an
		 * inner Pattern.
		 */
		get pattern(): Pattern | null
		{
			return this.phrase.terminal instanceof Pattern ?
				this.phrase.terminal :
				null;
		}
		
		/**
		 * Stores a string representation of the compiled regular expression
		 * associated with this instance, in the case when this instance is
		 * a pattern parallel.
		 * 
		 * This string representation should have any infixes compiled away,
		 * and should be passable to a JavaScript RegExp, or to the Fsm system.
		 */
		private compiledExpression: string | null = null;
		
		//# Contract-related members
		
		/** */
		get isContractSatisfied()
		{
			return this.contractConditionsUnsatisfied.size === 0;
		}
		
		/**
		 * Stores the set of parallels that any comparative parallel must 
		 * have in it's base graph in order to be deemed compliant.
		 */
		private get contractConditions()
		{
			if (!this._contractConditions)
				this.computeContract();
			
			return this._contractConditions!;
		}
		private _contractConditions: ReadonlySet<ExplicitParallel> | null = null;
		
		/**
		 * Stores the same set of parallels as the .contractConditions property,
		 * but as a mutable set that reduces in size, until reaching a size of 0,
		 * indicating that the contract has been fulfilled.
		 */
		private get contractConditionsUnsatisfied()
		{
			if (!this._contractConditionsUnsatisfied)
				this.computeContract();
			
			return this._contractConditionsUnsatisfied!;
		}
		private _contractConditionsUnsatisfied: Set<ExplicitParallel> | null = null;
		
		/**
		 * It's important that the contract conditions are computed lazily, 
		 * because if you try to compute it in the constructor, the Parallel
		 * graph won't be constructed, and you'll end up with an empty 
		 * contract.
		 */
		private computeContract()
		{
			const conditions = new Set<ExplicitParallel>();
			
			const recurse = (srcParallel: Parallel) =>
			{
				if (srcParallel instanceof ImplicitParallel)
				{
					for (const nestedParallel of srcParallel.getParallels())
						recurse(nestedParallel);
				}
				else if (srcParallel instanceof ExplicitParallel)
				{
					for (const { base } of srcParallel.eachBase())
						conditions.add(base);
				}
			};
			
			for (const higherParallel of this.getParallels())
				recurse(higherParallel);
			
			this._contractConditions = conditions;
			this._contractConditionsUnsatisfied = new Set(conditions);
		}
	}
	
	/**
	 * A type that describes an entry in the bases map
	 * of a ExplicitParallel.
	 */
	interface IBaseEntry
	{
		/**
		 * Stores the set of ExplicitParallels that caused the base to be constructed.
		 * Note that a base entry can have multiple parallels in the case when the base
		 * is actually a pattern with two equally viable matches in scope, and no contract
		 * being imposed, for example:
		 * ```
		 * /pattern : A
		 * /pattern : B
		 * C : pattern
		 * ```
		 * In the above case, C would have the bases A and B.
		 * 
		 * NOTE: This should actually be a fault. A clarifier type should be defined on
		 * C in order to disambiguate between A and B.
		 */
		parallels: ExplicitParallel[];
		
		/** Stores whether the term is an alias (matched by a pattern). */
		aliased: boolean;
	}
	
	/** @internal */
	export type TBaseTable = ReadonlyMap<ExplicitParallel, Fork>;
}
