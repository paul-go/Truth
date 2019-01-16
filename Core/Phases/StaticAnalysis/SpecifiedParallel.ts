import * as X from "../../X";


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
		return X.Parallel.getExistingParallel(node.uri, context) || 
			new X.SpecifiedParallel(node, container, context);
	}
	
	/** */
	private constructor(
		node: X.Node,
		container: X.SpecifiedParallel | null,
		context: X.LayerContext)
	{
		super(node.uri, container, context);
		this.node = node;
	}
	
	/** */
	readonly node: X.Node;
	
	/**
	 * Analyzes this SpecifiedParallel to scan for the following faults:
	 * 	UnresolvedAnnotationFault
	 * 	CircularTypeReference
	 * 	IgnoredAnnotation
	 * 	ListIntrinsicExtendingList
	 * 	ListExtrinsicExtendingNonList
	 * 
	 * This method may mark various parts of the document as cruft.
	 * It also computes the existence of the parallel (which is a term
	 * we're using to describe the set of annotations that have been
	 * applied to a type).
	 */
	analyze()
	{
		for (const hyperEdge of this.node.outbounds)
		{
			if (hyperEdge.successors.length > 1)
				X.PolymorphicResolver.resolve(this, hyperEdge, this.context);
		}
	}
	
	/** */
	get fullExistence()
	{
		return this._fullExistence || (this._fullExistence = new Set());
	}
	private _fullExistence: ReadonlySet<X.Node> | null = null;
	
	/** */
	get specifiedExistence()
	{
		return this._specifiedExistence || (this._specifiedExistence = new Set());
	}
	private _specifiedExistence: ReadonlySet<X.Node> | null = null;
	
	/** */
	get inferredExistence()
	{
		return this._inferredExistence || (this._inferredExistence = new Set());
	}
	private _inferredExistence: ReadonlySet<X.Node> | null = null;
	
	/**
	 * Creates a flattened set of Parallels that represent the
	 * other Parallels of which this parallel is said to be a kind.
	 * 
	 * This method is useful for computing equivalence relations
	 * between the annotation sets of two Parallel objects.
	 */
	computeExistence()
	{
		if (this.computedExistence !== null)
			return this.computedExistence;
		
		const existence = new Set<X.Node>();
		
		for (const parallel of this.traverseParallels())
			if (parallel instanceof X.SpecifiedParallel)
				existence.add(parallel.node);
		
		return this.computedExistence = existence;
	}
	
	/** */
	private computedExistence: ReadonlySet<X.Node> | null = null;
	
	/**
	 * Traverses through the general graph, depth-first, yielding
	 * elements that corresponds to this parallel, and returns an
	 * object that represents an edge that connects one node.
	 */
	*traverseGeneralEdges()
	{
		const context = this.context;
		type FromTo = IterableIterator<{ from: X.Node; to: X.Node }>;
		
		function *recurse(node: X.Node, hyperEdge: X.HyperEdge): FromTo
		{
			const scsr = context.getSelectedSuccesor(hyperEdge);
			if (scsr)
			{
				for (const deepHyperEdge of scsr.node.outbounds)
					yield* recurse(scsr.node, deepHyperEdge);
				
				yield { from: node, to: scsr.node };
			}
		}
		
		for (const hyperEdge of this.node.outbounds)
			yield* recurse(this.node, hyperEdge);
	}
	
	/** */
	descend(typeName: string): X.Parallel
	{
		const containedNode = this.node.contents.get(typeName);
		
		return containedNode === undefined ?
			X.UnspecifiedParallel.maybeConstruct(
				this.uri.extend([], typeName),
				this,
				this.context)
			:
			X.SpecifiedParallel.maybeConstruct(
				containedNode,
				this,
				this.context);
	}
}
