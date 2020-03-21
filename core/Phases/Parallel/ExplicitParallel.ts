
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
		get isContractSatisfied()
		{
			return this.contract.unsatisfiedConditions.size === 0;
		}
		
		/** */
		private get contract(): Contract
		{
			// It's important that this contract is computed lazily, because
			// if you try to compute it in the constructor, the Parallel graph
			// won't be constructed, and you'll end up with an empty contract.
			if (this._contract === null)
				this._contract = new Contract(this);
			
			return this._contract;
		}
		private _contract: Contract | null = null;
		
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
			
			const numSatisfied = this.contract.trySatisfyCondition(base);
			if (numSatisfied === 0 && this.contract.hasConditions)
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
		 * @param patternParallelCandidates The pattern-containing
		 * ExplicitParallel instance whose bases should be applied to this
		 * ExplicitParallel, if the provided alias is a match.
		 * 
		 * @param viaFork The Fork in which the alias was found.
		 * 
		 * @param viaAlias The string to test against the parallel embedded
		 * within patternParallelCandidates.
		 * 
		 * @returns A boolean value that indicates whether a base was added
		 * successfully.
		 */
		tryAddAliasedBase(
			patternParallelCandidates: ExplicitParallel[],
			viaFork: Fork,
			viaAlias: string)
		{
			if (this._bases.has(viaFork))
				throw Exception.unknownState();
			
			const chosenParallels = patternParallelCandidates.slice();
			const conditions = this.contract.unsatisfiedConditions;
			const beganWithConditions = conditions.size > 0;
			
			if (beganWithConditions)
			{
				let maxMatchCount = 1;
				
				nextCandidate: for (const candidate of patternParallelCandidates)
				{
					const candidateBases: ExplicitParallel[]  = [];
					for (const entry of candidate._bases.values())
						candidateBases.push(...entry.parallels);
					
					if (candidateBases.length < maxMatchCount)
						continue;
					
					for (const candidateBase of candidateBases)
						if (!conditions.has(candidateBase))
							continue nextCandidate;
					
					chosenParallels.push(candidate);
					maxMatchCount = candidateBases.length;
				}
				
				if (chosenParallels.length === 0)
					return false;
			}
			
			let wasAdded = false;
			
			for (const chosenParallel of chosenParallels)
			{
				// Just as a reminder -- pattern-containing parallels don't come
				// into this method–only the ones with aliases that might match them.
				if (this.pattern || !chosenParallel.pattern)
					throw Exception.unknownState();
				
				// If the targetPattern has no infixes, we can get away with a simple
				// check to see if the alias matches the regular expression.
				if (!chosenParallel.pattern.hasInfixes())
				{
					if (!chosenParallel.pattern.test(viaAlias))
						continue;
					
					if (beganWithConditions)
						if (this.contract.trySatisfyCondition(chosenParallel) === 0)
							continue;
					
					this.addBaseEntry(chosenParallel, viaFork, true);
					wasAdded = true;
				}
			}
			
			// Not implemented, but we shouldn't throw an exception here yet.
			return wasAdded;
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
				
				/**
				 * At this point, we need to test every single one of the 
				 * patterns in basesDeepSprawlPatterns against this
				 * this.phrase.terminal to make sure the two patterns
				 * are compliant.
				 * 
				 * If they're not compliant, we need to start marking
				 * bases as cruft until they are.
				 * 
				 * There is also a recursive infix embed process that
				 * needs to happen here, but maybe we should just
				 * put this off until the basic pattern functionality
				 * is working?
				 */
			}
			
			/**
			 * This also needs to take into account any other patterns
			 * that are applied to any of the bases defined directly
			 * inline.
			 */
			
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
		 * 
		 * /pattern : A
		 * /pattern : B
		 * 
		 * Value : pattern ~ A, B
		 */
		parallels: ExplicitParallel[];
		
		/** Stores whether the term is an alias (matched by a pattern). */
		aliased: boolean;
	}
		
	/** @internal */
	export type TBaseTable = ReadonlyMap<ExplicitParallel, Fork>;
}
