import * as X from "../../X";


/**
 * A class that manages an array of Span objects that
 * represent a specific spine of declarations, starting at
 * a document, passing through a series of spans,
 * and ending at a tip span.
 */
export class Spine
{
	/** */
	constructor(vertebrae: X.Span[])
	{
		if (vertebrae.length === 0)
			throw X.Exception.unknownState();
		
		this.tip = vertebrae[vertebrae.length - 1];
		this.vertebrae = vertebrae;
	}
	
	/** Stores the last span in the array of segments. */
	readonly tip: X.Span;
	
	/** */
	get statement() { return this.tip.statement }
	
	/** Gets a reference to the document that sits at the top of the spine. */
	get document() { return this.statement.document; }
	
	/** Stores an array of the Spans that compose the Spine. */
	readonly vertebrae: ReadonlyArray<X.Span> = [];
}
