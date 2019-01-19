import * as X from "../../X";


/**
 * A Layer is a graph of Parallel objects that represents a
 * complete level in a URI.
 */
export class Layer
{
	/** */
	constructor(
		readonly container: X.Layer | null,
		readonly uri: X.Uri,
		private readonly context: X.LayerContext)
	{
		this.name = uri.typePath.join("/");
	}
	
	/**
	 * Stores a string representation of the Layer,
	 * useful for debugging purposes.
	 */
	readonly name: string;
	
	/**
	 * Initializes a top-level Layer. This method is used instead
	 * of .descend() for top-level Layer construction.
	 * 
	 * @throws In the case when the specified Node instance 
	 * has a non-null container (and therefore, is not top level).
	 */
	bootstrap(node: X.Node)
	{
		if (node.container !== null)
			throw X.Exception.unknownState();
		
		this._seeds.push(X.SpecifiedParallel.maybeConstruct(
			node,
			null,
			this.context));
	}
	
	/**
	 * Maps this Parallel, and all it's connected Parallels, to the type
	 * in each of their contents with the specified name. 
	 */
	descend(typeName: string): Layer | null
	{
		const ctx = this.context;
		const outLayerUri = this.uri.extend([], [typeName]);
		const outLayer = new Layer(this, outLayerUri, ctx);
		
		/**
		 * Stores the Parallel objects that were found to be seeds,
		 * meaning that they have no inbound edges. All Parallels
		 * start off as these, and are removed from the set when
		 * it is discovered that the parallel has an inbound edge.
		 */
		const seedParallels = new Set<X.Parallel>();
		
		/**
		 * Stores a cache of edges that exist on the current layer only.
		 * The cache is built up in dependency order, though the
		 * iterations of the loop below.
		 * 
		 * (This isn't considering recursion just yet)
		 */
		const currentLayerEdgeCache = new X.MultiMap<X.Parallel, X.Parallel>();
		
		/**
		 * Key = Parallel on the current Layer
		 * Value = Corresponding Parallel, but for the next Layer.
		 */
		const currentToDescendMap = new Map<X.Parallel, X.Parallel>();
		
		for (const info of this.traverseLayer())
		{
			// This is a case I'm pretty sure can't happen (it would be a 
			// self-referencing rule), and these should be purged out
			// earlier in the pipeline.
			if (info.fromParallel === info.toParallel)
				throw X.Exception.unknownState();
			
			if (info.fromParallel !== null)
				currentLayerEdgeCache.add(info.fromParallel, info.toParallel);
			
			const descendParallel = (() =>
			{
				/**
				 * DOCUMENT: When are the cases when there is an existing
				 * descend parallel? What does the document look like in this
				 * case?
				 */
				const existingDescendPar = currentToDescendMap.get(info.toParallel);
				if (existingDescendPar !== undefined)
					return existingDescendPar;
				
				const newDescendPar = info.toParallel.descend(typeName);
				currentToDescendMap.set(info.toParallel, newDescendPar);
				seedParallels.add(newDescendPar);
				
				return newDescendPar;
			})();
			
			
			const edgeParallels = currentLayerEdgeCache.get(info.toParallel);
			if (edgeParallels !== undefined)
			{
				for (const edgeParallel of edgeParallels)
				{
					// Get the parallel object that was constructed in a previous
					// iteration of this loop. This should always return a value.
					const existingDescendPar = X.Guard.defined(
						currentToDescendMap.get(edgeParallel));
					
					descendParallel.maybeAddEdge(existingDescendPar);
					seedParallels.delete(existingDescendPar);
				}
			}
		}
		
		outLayer._seeds.push(...Array.from(seedParallels));
		return outLayer;
	}
		
	/**
	 * Traverses through the entire graph of Parallels that correspond
	 * to this Layer. 
	 */
	*traverseLayer()
	{
		for (const { from: fromPar, to: toPar } of this.traverseParallelEdges())
		{
			if (toPar instanceof X.SpecifiedParallel)
			{
				const iter = toPar.traverseGeneralEdges();
				for (const { from: fromGen, to: toGen } of iter)
				{
					const toLayer = this.context.maybeConstruct(toGen.uri);
					const fromLayer = this.context.maybeConstruct(fromGen.uri);
					
					if (toLayer === null || 
						fromLayer === null ||
						toLayer.origin === null ||
						fromLayer.origin === null)
					{
						debugger;
						continue;
					}
					
					yield <LayerEdge>{
						fromParallel: fromLayer.origin,
						fromNode: fromGen,
						toParallel: toLayer.origin,
						toNode: toGen
					};
				}
			}
			
			yield <LayerEdge>{
				fromParallel: fromPar,
				fromNode: fromPar instanceof X.SpecifiedParallel ? 
					fromPar.node : 
					null,
				toParallel: toPar,
				toNode: toPar instanceof X.SpecifiedParallel ?
					toPar.node :
					null
			};
		}
	}
	
	/**
	 * Performs a traversal on all nested Parallel objects in dependency
	 * order, and yields an object that forms an edge that represents
	 * a connection between two Parallel objects.
	 */
	*traverseParallelEdges()
	{
		type FromTo = IterableIterator<{ from: X.Parallel | null; to: X.Parallel }>
		
		function *recurse(from: X.Parallel | null, to: X.Parallel): FromTo
		{
			for (const next of to.edges)
				yield* recurse(to, next);
			
			yield { from, to };
		}
		
		for (const parallel of this._seeds)
			yield* recurse(null, parallel);
	}
	
	/**
	 * Performs a traversal of all nested Parallel objects in dependency
	 * order, meaning, the method does not yield Parallel objects until
	 * all its dependencies have also been yielded. The method also
	 * ensures that the same object is not yielded more than once.
	 */
	*traverseParallels()
	{
		const yielded = new Set<X.Parallel>();
		
		for (const { to } of this.traverseParallelEdges())
		{
			if (yielded.has(to))
				continue;
			
			yielded.add(to);
			yield to;
		}
	}
	
	/**
	 * Gets an array containing the Parallels that "seed" this
	 * Layer, meaning that they have no inbound edges.
	 */
	get seeds()
	{
		return Object.freeze(this._seeds.slice());
	}
	private readonly _seeds: X.Parallel[] = [];
	
	/**
	 * Gets the origin seed Parallel of this Layer, if one exists,
	 * or null in the case when it doesn't.
	 * 
	 * The orgin seed is available when there is exactly one
	 * SpecifiedParallel that seeds the Layer. This is the case
	 * when the LayerContext has been instructed to construct
	 * a URI pointing to a specific node.
	 */
	get origin()
	{
		if (this._seeds.length === 1)
		{
			const origin = this._seeds[0];
			if (origin instanceof X.SpecifiedParallel)
				return origin;
		}
		
		return null;
	}
	
	/**
	 * Gets an array of 
	 */
	get patterns()
	{
		return this._patterns === null ?
			this._patterns = new X.LayerPatterns(this) : 
			this._patterns;
	}
	private _patterns: X.LayerPatterns | null = null;
	
	/**
	 * @internal
	 */
	debug()
	{
		//viz(this.seeds, value =>
		//{
		//	if (value instanceof X.Parallel)
		//		return value.edges;
		//});
	}
}


/** */
export interface LayerEdge
{
	fromParallel: X.Parallel | null;
	fromNode: X.Node | null;
	toParallel: X.Parallel;
	toNode: X.Node | null;
}
