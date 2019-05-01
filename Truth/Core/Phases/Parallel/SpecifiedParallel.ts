import * as X from "../../X";


/**
 * 
 */
export class SpecifiedParallel extends X.Parallel
{
	/**
	 * @internal
	 * Invoked by ParallelCache. Do not call.
	 */
	constructor(
		node: X.Node,
		container: X.SpecifiedParallel | null,
		cruft: X.CruftCache)
	{
		super(node.uri, container);
		this.node = node;
		this.cruft = cruft;
		
		node.document.program.faults.inform(node);
	}
	
	/**
	 * Stores the Node instance that corresponds to this
	 * SpecifiedParallel instance.
	 */
	readonly node: X.Node;
	
	/** */
	get isContractSatisfied()
	{
		return this.contract.unsatisfiedConditions.size === 0;
	}
	
	/** */
	private get contract(): X.Contract
	{
		// It's important that this contract is computed lazily, because
		// if you try to compute it in the constructor, the Parallel graph
		// won't be constructed, and you'll end up with an empty contract.
		if (this._contract === null)
			this._contract = new X.Contract(this);
		
		return this._contract;
	}
	private _contract: X.Contract | null = null;
	
	/** */
	private readonly cruft: X.CruftCache;
	
	/**
	 * Gets the first base contained by this instance.
	 * @throws In the case when this instance contains no bases.
	 */
	get firstBase()
	{
		for (const baseEntry of this._bases.values())
			return baseEntry.parallel;
		
		throw X.Exception.unknownState();
	}
	
	/**
	 * Performs a shallow traversal on the non-cruft bases
	 * defined directly on this Parallel.
	 */
	*eachBase()
	{
		for (const [hyperEdge, baseEntry] of this._bases)
			if (!this.cruft.has(hyperEdge))
				yield { 
					base: baseEntry.parallel,
					edge: hyperEdge,
					aliased: baseEntry.aliased
				};
	}
	private readonly _bases = new Map<X.HyperEdge, IBaseEntry>();
	
	/**
	 * Performs a deep traversal on the non-cruft bases
	 * defined on this Parallel.
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
	 * SpecifiedParallel instance exists somewhere, possibly nested,
	 * in the base graph of this instance.
	 */
	hasBase(testBase: X.SpecifiedParallel)
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
	 * Attempts to add the provided SpecifiedParallel as a base of
	 * this instance. If the addition of the new base would not generate
	 * any critical faults, it is added. Otherwise, it's marked as cruft.
	 * 
	 * @returns A boolean value that indicates whether the base
	 * was added successfully.
	 */
	tryAddLiteralBase(base: X.SpecifiedParallel, via: X.HyperEdge)
	{
		if (this._bases.has(via))
			throw X.Exception.unknownState();
		
		// Just as a reminder -- pattern-containing parallels 
		// don't come into this method. Bases are applied to
		// patterns in tryApplyPatternBases.
		if (this.pattern)
			throw X.Exception.unknownState();
		
		const satisfyCount = this.contract.trySatisfyCondition(base);
		if (satisfyCount === 0 && this.contract.hasConditions)
			return false;
		
		const sanitizer = new X.Sanitizer(this, base, via, this.cruft);
		
		// In this case, we only need to do a 
		// shallow check for circular inheritance.
		if (sanitizer.detectCircularReferences())
			return false;
		
		if (sanitizer.detectListFragmentConflicts())
			return false;
		
		if (this.baseCount > 0)
		{
			if (sanitizer.detectListDimensionalityConflict())
				return false;
		}
		
		this._bases.set(via, { parallel: base, aliased: false });
		return true;
	}
	
	/**
	 * Attempts to indirectly apply a base to this SpecifiedParallel via an alias
	 * and edge.
	 * 
	 * @param patternParallelCandidates The pattern-containing
	 * SpecifiedParallel instance whose bases should be applied to this
	 * SpecifiedParallel, if the provided alias is a match.
	 * 
	 * @param viaEdge The HyperEdge in which the alias was found.
	 * 
	 * @param viaAlias The string to test against the parallel embedded
	 * within patternParallelCandidates.
	 * 
	 * @returns A boolean value that indicates whether a base was added
	 * successfully.
	 */
	tryAddAliasedBase(
		patternParallelCandidates: X.SpecifiedParallel[],
		viaEdge: X.HyperEdge,
		viaAlias: string)
	{
		if (this._bases.has(viaEdge))
			throw X.Exception.unknownState();
		
		const candidatesPruned: X.SpecifiedParallel[] = [];
		const conditions = this.contract.unsatisfiedConditions;
		let maxMatchCount = 0;
		
		for (const candidate of patternParallelCandidates)
		{
			const candidateBases = Array.from(candidate._bases.values()).map(e => e.parallel);
			if (candidateBases.length === 0)
				continue;
			
			const allMatched = candidateBases.every(par => conditions.has(par));
			
			if (allMatched && candidateBases.length >= maxMatchCount)
			{
				candidatesPruned.push(candidate);
				maxMatchCount = candidateBases.length;
			}
		}
		
		// TODO: Add support for parallels that match multiple patterns.
		
		const chosenParallel = candidatesPruned[0];
		const chosenPattern = chosenParallel.pattern;
		
		// Just as a reminder -- pattern-containing parallels don't come
		// into this method ... only the aliases that might match them.
		if (this.pattern || !chosenPattern)
			throw X.Exception.unknownState();
		
		// If the targetPattern has no infixes, we can get away with a simple
		// check to see if the alias matches the regular expression.
		if (!chosenPattern.hasInfixes())
		{
			if (!chosenPattern.test(viaAlias))
				return false;
			
			this._bases.set(viaEdge, {
				parallel: chosenParallel,
				aliased: true
			});
			
			this.contract.trySatisfyCondition(chosenParallel);
			return true;
		}
		
		// Not implemented, but we shouldn't throw an exception here yet.
		return false;
	}
	
	/**
	 * Attempts to apply a set of bases to a pattern-containing parallel.
	 * 
	 * @example
	 * /pattern : This, Function, Adds, These
	 */
	tryApplyPatternBases(baseTable: X.TBaseTable)
	{
		const bases = Array.from(baseTable.keys());
		
		// Non-Pattern nodes should never come to this method.
		if (!this.pattern)
			throw X.Exception.unknownState();
		
		const basesDeep = bases
			.map(b => Array.from(b.eachBaseDeep()))
			.reduce((a, b) => a.concat(b), [])
			.filter((v, i, a) => a.indexOf(v) === i);
		
		// Reminder: the SpecifiedParallels in the basesDeep array
		// are expected to be fully processed by the time we get to
		// this method. It should be safe to touch them.
		
		if (basesDeep.length > 0)
		{
			const basesNodes = bases.map(b => b.node);
			
			// Finds all pattern nodes that have an edge that points
			// to at least one of the bases in the basesDeep array.
			const basesDeepSprawl = basesDeep
				.map(b => Array.from(b.node.inbounds))
				.reduce((a, b) => a.concat(b), [])
				.map(inb => inb.predecessor)
				.filter((v, i, a) => a.indexOf(v) === i)
				.filter(node => node.subject instanceof X.Pattern)
				.filter(node => node.outbounds
					.filter(ob => ob.successors.length === 0)
					.map(ob => ob.successors[0].node)
					.every(node => basesNodes.includes(node)));
			
			const basesDeepSprawlPatterns = basesDeepSprawl
				.map(n => n.subject)
				.filter((s): s is X.Pattern => s instanceof X.Pattern);
			
			/**
			 * At this point, we need to test every single one of the 
			 * patterns in basesDeepSprawlPatterns against this
			 * this.node.subject to make sure the two patterns are
			 * compliant.
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
		// or not any of the associated edges were marked as cruft.
		// The other enumerators skip over cruft edges, so this likely
		// isn't a problem, and it keeps it consistent with the way the
		// rest of the system works.
		for (const [base, via] of baseTable)
			this._bases.set(via, { parallel: base, aliased: false });
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
	get isListIntrinsic()
	{
		return this.node.isListIntrinsic;
	}
	
	/** */
	get intrinsicExtrinsicBridge()
	{
		return this._intrinsicExtrinsicBridge;
	}
	private _intrinsicExtrinsicBridge: X.SpecifiedParallel | null = null;
	
	/**
	 * Establishes a bridge between this SpecifiedParallel and the
	 * one provided. 
	 */
	createIntrinsicExtrinsicBridge(parallel: X.SpecifiedParallel)
	{
		if (this._intrinsicExtrinsicBridge !== null)
			throw X.Exception.unknownState();
		
		if (parallel._intrinsicExtrinsicBridge !== null)
			throw X.Exception.unknownState();
		
		if (parallel.node.isListIntrinsic === this.node.isListIntrinsic)
			throw X.Exception.unknownState();
		
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
		for (const { base, edge } of this.eachBase())
		{
			const initialDim = base.getListDimensionality();
			return edge.isList ? initialDim + 1 : initialDim;
		}
		
		return 0;
	}
	
	/**
	 * 
	 */
	private comparePatternTo(other: X.SpecifiedParallel)
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
	 * Gets the Pattern instance that resides inside this SpecifiedParallel,
	 * or null in the case when this SpecifiedParallel does not have an
	 * inner Pattern.
	 */
	get pattern(): X.Pattern | null
	{
		return this.node.subject instanceof X.Pattern ?
			this.node.subject :
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
 * of a SpecifiedParallel.
 */
interface IBaseEntry
{
	/** Stores the SpecifiedParallel that caused the base to be constructed. */
	parallel: X.SpecifiedParallel;
	
	/** Stores whether the identifier is an alias (matched by a pattern). */
	aliased: boolean;
}
