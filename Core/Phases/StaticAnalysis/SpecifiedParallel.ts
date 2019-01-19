import * as X from "../../X";


const uris = new Set<string>();

/**
 * 
 */
export class SpecifiedParallel extends X.Parallel
{
	/**
	 * Constructs a SpecifiedParallel object, or returns a
	 * pre-existing one that corresponds to the specified Node.
	 */
	static maybeConstruct(
		node: X.Node,
		container: X.SpecifiedParallel | null,
		context: X.LayerContext)
	{
		const existingParallel = X.Parallel.getExistingParallel(node.uri, context);
		if (existingParallel)
			return existingParallel;
		
		const parallel = new X.SpecifiedParallel(node, container, context);
		
		/**
		 * We need to detect circular references here
		 * This is easy if you don't bother with code reuse.
		 */
		
		for (const { from, to } of parallel.traverseBaseEdges())
		{
			const uriText = to.uri.typePath.join("/");
			if (uris.has(uriText))
				continue;
			
			uris.add(uriText);
			console.log("> " + uriText);
		}
		
		const uriText = parallel.node.uri.typePath.join("/");
		if (!uris.has(uriText))
		{
			console.log("> " + uriText);
			uris.add(uriText);
		}
		
		/**
		 * You only start doing analysis when you're one
		 * behind the apex. You obviously can't do traversal
		 * at the actual apex because there's no other edges
		 * to follow. You could easily just pass a depth parameter
		 * in through the enumerator.
		 * 
		 * So then next question then is, even if you've done this,
		 * you still need to be able to access stuff within the depths
		 * of the graph.
		 */
		
		return parallel;
	}
	
	/** */
	private constructor(
		node: X.Node,
		container: X.SpecifiedParallel | null,
		context: X.LayerContext)
	{
		super(node.uri, container, context);
		this.node = node;
		context.resolveSuccessors(this);
		
		// Compute the existence (if we need to do this)
		// Compute whether the thing is a list
		// Maybe also find the associated patterns as well?
		
		/**
		 * In this area, we can be sure that we can touch
		 * any of the successors, because they've either 
		 * been pruned, or we're at the very top, and it
		 * doesn't matter.
		 */
	}
	
	/**
	 * Stores the Node instance that corresponds to this
	 * SpecifiedParallel instance.
	 */
	readonly node: X.Node;
	
	/**
	 * Traverses through the base graph, depth-first, yielding
	 * elements that corresponds to this parallel, and returns an
	 * object that represents an edge that connects one node.
	 */
	*traverseBaseEdges()
	{
		const context = this.context;
		type FromTo = IterableIterator<{ from: X.Node; to: X.Node }>;
		
		function *recurse(node: X.Node, scsr: X.Successor): FromTo
		{
			for (const deepScsr of context.eachSuccessorOf(scsr.node))
				yield* recurse(scsr.node, deepScsr);
				
			yield { from: node, to: scsr.node };
		}
		
		for (const scsr of context.eachSuccessorOf(this.node))
			yield* recurse(this.node, scsr);
	}
	
	/**
	 * @ignore
	 * 
	 * Traverses through the base edge graph, and yields
	 * the parallel that corresponds to each discovered node,
	 * as well as the successor attached to this SpecifiedParallel
	 * instance through which the corresponding SpecifiedParallel
	 * was discovered.
	 */
	//*traverseBaseEdgeParallels()
	//{
	//	for (const via of this.context.eachSuccessorOf(this.node))
	//	{
	//		for (const { to } of this.traverseBaseEdges())
	//		{
	//			const parallel = this.context.getParallelOf(to);
	//			if (parallel)
	//				yield { via, parallel };
	//		}
	//	}
	//}
	
	/**
	 * @ignore
	 * 
	 * Same as traverseBaseEdgeParallels, but returns a map
	 * with the results instead of yielding individual results.
	 */
	getBaseEdgeParallelSet()
	{
		const map = new Map<X.Successor, ReadonlyArray<X.Parallel>>();
		
		for (const via of this.context.eachSuccessorOf(this.node))
		{
			const parallels: X.Parallel[] = [];
			
			for (const { to } of this.traverseBaseEdges())
			{
				const parallel = this.context.getParallelOf(to);
				if (parallel)
					parallels.push(parallel);
			}
			
			map.set(via, Object.freeze(parallels));
		}
		
		return map;
	}
	
	/**
	 * 
	 */
	//reduceRecursive<TVal>(callbackFn: (
	//	accumulatedResults: Map<X.Successor, TVal>,
	//	parallel: X.SpecifiedParallel,
	//	depth: number) => TVal, initialValue: TVal): TVal
	//{
	//	return null!;
	//}
	
	/**
	 * Analyzes this SpecifiedParallel to scan for the following faults:
	 * 	CircularTypeReference
	 * 	ListIntrinsicExtendingList
	 * 	ListExtrinsicExtendingNonList
	 * 	ListDimensionalDiscrepancyFault
	 * 	IgnoredAnnotation
	 * 	UnresolvedAnnotationFault
	 * 
	 * This method may mark various parts of the document as cruft.
	 * It also computes the existence of the parallel (which is a term
	 * we're using to describe the set of annotations that have been
	 * applied to a type).
	 * 
	 * This method also assumes that it's being called only after all
	 * it's higher Parallels (i.e. Parallels that exist higher than this
	 * one in the Layer) have been analyzed.
	 * 
	 * @deprecated
	 */
	analyze()
	{
		const proposedExistence: X.Node[] = [];
		
		for (const { to } of this.traverseBaseEdges())
			if (!proposedExistence.includes(to))
				proposedExistence.push(to);
		
		const existenceContract: X.Node[] = [];
		
		for (const higherPar of this.traverseParallelsSpecified())
			for (const nodeInExistence of higherPar.existence)
				if (existenceContract.includes(nodeInExistence))
					existenceContract.push(nodeInExistence);
		
		//const unmetNodes = existenceContract.filter(n => existence.includes(n));
		//if (unmetNodes.length > 0)
		//	for (const node of unmetNodes)
		//		this._faults.push(new 
		
		this._existence = Object.freeze(proposedExistence);
		//this._isList = existenceContract.
	}
	
	/**
	 * Maps this Parallel instance to another Parallel instance
	 * that corresponds to a Node in this Parallel's underlying
	 * Node's contents.
	 */
	descend(typeName: string): X.Parallel
	{
		const containedNode = this.node.contents.get(typeName);
		if (containedNode === undefined)
		{
			return X.UnspecifiedParallel.maybeConstruct(
				this.uri.extend([], typeName),
				this,
				this.context);
		}
		
		return X.SpecifiedParallel.maybeConstruct(
			containedNode,
			this,
			this.context);
	}
	
	/** */
	get existence()
	{
		//if (this._existence === null)
		//	throw X.Exception.invalidCall();
		
		return this._existence || [];
	}
	private _existence: ReadonlyArray<X.Node> | null = null;
	
	/**
	 * Gets a string that represents the existence of this
	 * SpecifiedParallel instance, useful for debugging.
	 */
	private get existenceLabel()
	{
		return this._existence !== null ?
			this.existence.map(n => n.name).join(" + ") :
			"(not computed)";
	}
	
	/** */
	get listDimensionality()
	{
		if (this._listDimensionality >= 0)
			return this._listDimensionality;
		
		//const val = this.reduceRecursive((results, par, depth) => 
		//{
		//	const max = Math.max(...results.values());
		//	
		//	return max + par.;
		//},
		//0);
		//
		const val = 0;
		return this._listDimensionality = val;
	}
	private _listDimensionality = -1;
	
	/** */
	get isList()
	{
		//if (this._isList === null)
		//	throw X.Exception.invalidCall();
		
		return this._isList || false;
	}
	private _isList: boolean | null = null;
}
