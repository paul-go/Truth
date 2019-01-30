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
	}
	
	/**
	 * Stores the Node instance that corresponds to this
	 * SpecifiedParallel instance.
	 */
	readonly node: X.Node;
	
	/** */
	private readonly cruft: X.CruftCache;
	
	/**
	 * Gets the first base contained by this instance.
	 * @throws In the case when this instance contains no bases.
	 */
	get firstBase()
	{
		for (const [edge, parallel] of this._bases)
			return parallel;
		
		throw X.Exception.unknownState();
	}
	
	/**
	 * Performs a shallow traversal on the non-cruft bases
	 * defined directly on this Parallel.
	 */
	*eachBase()
	{
		for (const [key, value] of this._bases)
			if (!this.cruft.has(key))
				yield { base: value, edge: key };
	}
	private readonly _bases = new Map<X.HyperEdge, X.SpecifiedParallel>();
	
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
		// don't come into this method.
		if (this.node.subject instanceof X.Pattern)
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
		
		this._bases.set(via, base);
		return true;
	}
	
	/**
	 * Attempts to apply bases to this SpecifiedParallel, that are nested within
	 * the provided target.
	 * 
	 * @param targetPatternParallel The pattern-containing SpecifiedParallel
	 * instance whose bases should be applied to this SpecifiedParallel,
	 * if the provided alias is a match.
	 * 
	 * @param viaEdge The HyperEdge in which the alias was found.
	 * 
	 * @param viaAlias The string to test against the parallel embedded
	 * within targetPatternParallel.
	 * 
	 * @returns A boolean value that indicates whether a base was added
	 * successfully.
	 */
	tryAddAliasBase(
		targetPatternParallel: X.SpecifiedParallel,
		viaEdge: X.HyperEdge,
		viaAlias: string)
	{
		if (this._bases.has(viaEdge))
			throw X.Exception.unknownState();
		
		// Just as a reminder -- pattern-containing parallels don't come
		// into this method ... only the aliases that might match them.
		if (this.node.subject instanceof X.Pattern)
			throw X.Exception.unknownState();
		
		debugger;
		return true;
	}
	
	/**
	 * Attempts to apply a set of bases to a pattern-containing parallel.
	 * 
	 * @example
	 * /pattern : This, Function, Adds, These
	 */
	tryApplyPatternBases(bases: ReadonlyArray<X.SpecifiedParallel>)
	{
		const pattern = this.node.subject;
		
		// Non-Pattern nodes should never come to this method.
		if (!(pattern instanceof X.Pattern))
			throw X.Exception.unknownState();
		
		const basesDeep = bases
			.map(b => Array.from(b.eachBaseDeep()))
			.reduce((a, b) => a.concat(b))
			.filter((v, i, a) => a.indexOf(v) === i);
		
		// Reminder: the SpecifiedParallels in the basesDeep array
		// are expected to be fully processed by the time we get to
		// this method. It should be safe to touch them.
		
		if (basesDeep.length > 0)
		{
			const basesNodes = Object.freeze(bases.map(b => b.node));
			
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
			
			const basesText = bases.map(b => b.name).join(" & ");
			console.log(`---- Pattern Node Sprawl: ${basesText} ----`);
			
			for (const node of basesDeepSprawl)
				console.log(node.name);
			
			console.log("----------------------------------------");
		}
		
		console;
		
		// Deal with testing compatibility
		// Deal with infixes
		
		/**
		 * Find every pattern whose bases are a subset of the bases
		 * provided.
		 * 
		 * Then this graph needs to be traversed as pairs in topological 
		 * order so that we can determine if the pair has the required
		 * set relationship. The function that determines if a pair has the 
		 * right set relationship also has to take into account the 4 kinds
		 * of infixes.
		 * 
		 * Topological order such that A depends on B means that
		 * the set of bases applied to by A is a subset of the set of
		 * bases applied to be B.
		 * 
		 * This graph needs to take into account both
		 * inheritance and widening.
		 */
		
		
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
	
	/** */
	get isContractSatisfied()
	{
		return this.contract.unsatisfiedConditions.size > 0;
	}
	
	/** */
	private readonly contract: X.Contract = new X.Contract(this);
}
