import * as X from "../../X";


/**
 * Stores the information that relates to the Patterns that
 * have been defined within a single Layer.
 */
export class LayerPatterns
{
	/** */
	constructor(private readonly layer: X.Layer) { }
	
	/**
	 * Stores the nodes that define patterns.
	 */
	readonly nodes: X.Node[] = [];
	
	/**
	 * @returns The pattern-defining node whose bases
	 * precisely correspond to the specified set of nodes.
	 */
	find(resolvingTo: X.Node[]): X.Node | null
	{
		return null;
	}
	
	/**
	 * Attempts to feed the specified string into all of the
	 * patterns that are defined within this LayerPatterns
	 * instance. 
	 * 
	 * @param filterByNodes If specified, only the pattern-defining
	 * node whose bases precisely correspond to the specified
	 * set of nodes will be included in the returned array.
	 */
	tryExecute(maybeAlias: string, filterByNodes?: X.Node[]): X.Node | null
	{
		return null;
	}
}
