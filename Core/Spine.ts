import * as X from "./X";


/**
 * A class that manages an array of Span objects that
 * represent a specific spine of declarations, starting at
 * a document, passing through a series of spans,
 * and ending at a tip span.
 */
export class Spine
{
	/** */
	constructor(nodes: X.Span[])
	{
		if (nodes.length === 0)
			throw X.ExceptionMessage.unknownState();
		
		this.tip = nodes[nodes.length - 1];
		this.nodes = nodes;
	}
	
	/** Stores the last span in the array of segments. */
	readonly tip: X.Span;
	
	/** */
	get statement() { return this.tip.statement }
	
	/** Gets a reference to the document that sits at the top of the spine. */
	get document() { return this.statement.document; }
	
	/**  */
	readonly nodes: ReadonlyArray<X.Span> = [];
}
