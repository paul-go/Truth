import * as X from "../../X";


/**
 * A HyperEdge connects an origin predecessor Node to a series of
 * successor Nodes. From graph theory, a "hyper edge" is different
 * from an "edge" in that it can have many successors:
 * https://en.wikipedia.org/wiki/Hypergraph
 */
export class HyperEdge
{
	constructor(
		/**
		 * The Node from where the HyperEdge connection begins.
		 * For example, given the following document:
		 * 
		 * Foo
		 * 	Bar : Foo
		 * 
		 * Two Node objects would be created, one for the first instance
		 * of "Foo", and another for the instance of "Bar". A HyperEdge
		 * would be created between "Bar" and "Foo", and it's
		 * precedessor would refer to the Node representing the
		 * instance of "Bar".
		 */
		readonly predecessor: X.Node,
		/**
		 * 
		 */
		source: X.Span | X.InfixSpan,
		/**
		 * Stores all possible success Nodes to which the predecessor 
		 * Node is preemptively connected via this HyperEdge. The 
		 * connection is said to be preemptive, because the connection
		 * might be ignored during polymorphic name resolution.
		 */
		readonly successors: ReadonlyArray<X.Successor>)
	{
		if (!(source.boundary.subject instanceof X.Identifier))
			throw X.Exception.unknownState();
		
		const successorNodes = successors
			.map(scsr => scsr.node)
			.filter((v, i, a) => a.indexOf(v) === i);
		
		if (successorNodes.length !== successors.length)
			throw X.Exception.unknownState();
		
		this.identifier = source.boundary.subject;
		this.sourcesMutable = [source];
	}
	
	/** */
	addSource(source: X.Span | X.InfixSpan)
	{
		const isPattern = this.predecessor.subject instanceof X.Pattern;
		const isInfix = source instanceof X.InfixSpan;
		if (isPattern !== isInfix)
			throw X.Exception.invalidCall();
		
		if (this.sourcesMutable.includes(source))
			return;
		
		debugger;
		"The ordering of the sources is not being handled here."
		
		this.sourcesMutable.push(source);
	}
	
	/** */
	removeSource(source: X.Span | X.InfixSpan)
	{
		const sourcePos = this.sourcesMutable.indexOf(source);
		if (sourcePos >= 0)
			this.sourcesMutable.splice(sourcePos, 1);
	}
	
	/** */
	clearSources()
	{
		this.sourcesMutable.length = 0;
	}
	
	/**
	 * The set of annotation-side Spans or annotation-side InfixSpans
	 * that are responsible for the conception of this HyperEdge.
	 * 
	 * The original locations of these Spans (and InfixSpans?) are
	 * potentially scattered across many statements.
	 */
	get sources()
	{
		return Object.freeze(this.sourcesMutable.slice());
	}
	
	/** */
	private readonly sourcesMutable: (X.Span | X.InfixSpan)[];
	
	/**
	 * The textual value of an Edge represents different things
	 * depending on the Edge's *kind* property.
	 * 
	 * If *kind* is *literal*, the textual value is the given name
	 * of the type being referenced, for example "String" or
	 * "Employee".
	 * 
	 * If *kind* is *categorical*, the textual value is an alias that
	 * will later be resolved to a specific type, or set of types, for
	 * example "10cm" (presumably resolving to "Unit") or
	 * "user@email.com" (presumable resolving to "Email").
	 * 
	 * If *kind* is *summation* , the textual value is the raw
	 * literal text of the annotation found in the document. For
	 * example, if the document had the content:
	 * 
	 * Foo, Bar : foo, bar
	 * 
	 * This would result in two nodes named "Foo" and "Bar",
	 * each with their own HyperEdges whose textual values
	 * would both be: "foo, bar". In the case of a fragmented
	 * type, the last sum in document order is counted as the
	 * textual value. For example, given the following
	 * document:
	 * 
	 * T : aa, bb
	 * T : xx, yy
	 * 
	 * The "T" node would have a HyperEdge with a textual 
	 * value being "xx, yy".
	 * 
	 * The *-overlay kinds have not yet been implemented.
	 */
	readonly identifier: X.Identifier;
	
	/**
	 * @returns A string representation of this HyperEdge,
	 * suitable for debugging and testing purposes.
	 */
	toString()
	{
		return [
			"Value=" + this.identifier,
			"Preds=" + this.predecessor.name,
			"Succs=" + this.successors
				.map(n => n.node.name + " << " + n.longitude)
				.join(", "),
			"Sources=" + Array.from(this.sources)
				.map(src => src.boundary.subject).join(", ")
		].join("\n");
	}
}


/**
 * 
 */
export class Successor
{
	constructor(
		readonly node: X.Node,
		/**
		 * The the number of levels of depth in the containment
		 * hierarchy that need to be crossed in order for the containing
		 * HyperEdge to be established between the predecessor and
		 * this successor.
		 */
		readonly longitude: number)
	{ }
	
	readonly stamp = X.VersionStamp.next();
}
