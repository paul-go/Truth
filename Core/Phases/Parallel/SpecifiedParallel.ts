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
}
