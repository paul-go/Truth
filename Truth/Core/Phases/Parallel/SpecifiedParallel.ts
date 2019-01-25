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
	
	/** */
	*eachBase()
	{
		for (const [key, value] of this._bases)
			if (!this.cruft.has(key))
				yield { base: value, edge: key };
	}
	private readonly _bases = new Map<X.HyperEdge, X.SpecifiedParallel>();
	
	/**
	 * Gets the number of bases that have 
	 * been explicitly applied to this Parallel.
	 */
	get baseCount()
	{
		return this._bases.size;
	}
	
	/** */
	addBase(base: X.SpecifiedParallel, via: X.HyperEdge)
	{
		if (this._bases.has(via))
			throw X.Exception.unknownState();
		
		this._bases.set(via, base);
	}
	
	/** */
	get isListIntrinsic()
	{
		return this.node.isListExtrinsic;
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
}
