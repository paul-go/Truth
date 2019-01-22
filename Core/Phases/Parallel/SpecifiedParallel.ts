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
		this.contract = new X.ParallelContract(this);
	}
	
	/**
	 * Stores the Node instance that corresponds to this
	 * SpecifiedParallel instance.
	 */
	readonly node: X.Node;
	
	/** */
	readonly contract: X.ParallelContract;
	
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
	
	/** */
	get hasBases()
	{
		return this._bases.size > 0;
	}
	
	/** */
	addBase(base: X.SpecifiedParallel, via: X.HyperEdge)
	{
		if (this._bases.has(via))
			throw X.Exception.unknownState();
		
		this._bases.set(via, base);
	}
}
