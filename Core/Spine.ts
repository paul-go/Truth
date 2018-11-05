import * as X from "./X";


/**
 * A class that manages an array of Pointer objects that
 * represent a specific spine of declarations, starting at
 * a document, passing through a series of pointers,
 * and ending at a tip pointer.
 */
export class Spine
{
	/** */
	constructor(nodes: X.Pointer[])
	{
		if (nodes.length === 0)
			throw X.ExceptionMessage.unknownState();
		
		this.tip = nodes[nodes.length - 1];
		this.nodes = nodes;
	}
	
	/** Stores the last pointer in the array of segments. */
	readonly tip: X.Pointer;
	
	/** */
	get statement() { return this.tip.statement }
	
	/** Gets a reference to the document that sits at the top of the spine. */
	get document() { return this.statement.document; }
	
	/**  */
	readonly nodes: ReadonlyArray<X.Pointer> = [];
}
