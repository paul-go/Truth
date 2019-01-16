import * as X from "../../X";


/**
 * 
 */
export class PolymorphicResolver
{
	/**
	 * Executes the polymorphic name resolution strategy,
	 * and stores the results in the specified ConstructionContext
	 * object.
	 * 
	 * The method assumes that the edges of the specified
	 * parallel, and all it's edges (nested deeply) have already
	 * been resolved.
	 */
	static resolve(
		parallel: X.SpecifiedParallel,
		hyperEdge: X.HyperEdge,
		context: X.LayerContext)
	{
		if (hyperEdge.successors.length < 2)
			throw X.Exception.unknownState();
		
		const polymorphicDecisions = new Map<X.HyperEdge, X.Successor>();
		const findPolymorphicEdges = (edge: X.HyperEdge) =>
		{
			if (polymorphicDecisions.has(edge))
				return;
			
			for (const successor of edge.successors)
				for (const edge of successor.node.outbounds)
					findPolymorphicEdges(edge);
			
			if (edge.successors.length > 1)
			{
				if (context.getSelectedSuccesor(edge) === null)
				{
					const selectedSuccessor = this.selectSuccessor(parallel, edge, context);
					polymorphicDecisions.set(edge, selectedSuccessor);
					context.selectSuccessor(selectedSuccessor);
				}
			}
		}
		
		findPolymorphicEdges(hyperEdge);
	}
	
	/**
	 * Selects the most applicable Successor object of a HyperEdge,
	 * using the name resolution rules in the language specification.
	 * 
	 * The algorithm moves it's way up the scope chain, and selects
	 * at the nearest node target whose "existence" captures the
	 * existence computed locally (fix description).
	 */
	private static selectSuccessor(
		parallel: X.SpecifiedParallel,
		hyperEdge: X.HyperEdge,
		context: X.LayerContext)
	{
		const srcExistence = parallel.inferredExistence;
		let greatestFactor = -1;
		let resolveTarget: X.Successor | null = null;
		
		for (const successor of hyperEdge.successors)
		{
			const layer = context.maybeConstruct(successor.node.uri);
			if (!layer || !layer.origin)
				continue;
			
			const dstExistence = layer.origin.inferredExistence;
			const factor = this.computeSubsetFactor(srcExistence, dstExistence);
			
			if (factor > greatestFactor)
			{
				greatestFactor = factor;
				resolveTarget = successor;
			}
		}
		
		return resolveTarget || hyperEdge.successors[0];
	}
	
	/**
	 * @returns The number of items that are missing from the second
	 * set that exist in the first set.
	 */
	private static computeSubsetFactor(a: ReadonlySet<any>, b: ReadonlySet<any>)
	{
		let count = 0;
		
		for (const item of a)
			count += b.has(item) ? 0 : 1;
		
		return count;
	}
	
	/** */
	private constructor() { }
}
