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
		source: X.Span | X.InfixSpan | string,
		/**
		 * Stores all possible success Nodes to which the predecessor 
		 * Node is preemptively connected via this HyperEdge. The 
		 * connection is said to be preemptive, because the connection
		 * might be ignored during polymorphic name resolution.
		 */
		readonly successors: ReadonlyArray<X.Successor>,
		readonly kind: HyperEdgeKind)
	{
		if (typeof source === "string")
		{
			if (kind !== X.HyperEdgeKind.summation)
				throw X.Exception.invalidCall();
			
			this.sourcesMutable = [];
		}
		else this.sourcesMutable = [source];
	}
	
	/** */
	addSource(source: X.Span | X.InfixSpan)
	{
		const isPattern = this.predecessor.subject instanceof X.Pattern;
		const isInfix = source instanceof X.InfixSpan;
		if (isPattern !== isInfix)
			throw X.Exception.invalidCall();
		
		// We also need to deal with ordering here.
		
		
		
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
	 * 
	 * In the case when the *kind* field is *summation*, this set
	 * must be empty.
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
	get textualValue()
	{
		const srcs = this.sources;
		
		return this.kind === X.HyperEdgeKind.summation ?
			srcs[srcs.length - 1].statement.sum :
			srcs[0].boundary.subject.toString();
	}
	
	/**
	 * @returns A string representation of this HyperEdge,
	 * suitable for debugging and testing purposes.
	 */
	toString()
	{
		return [
			"Value=" + this.textualValue,
			"Preds=" + this.predecessor.name,
			"Succs=" + this.successors
				.map(n => n.node.name + " << " + n.longitude)
				.join(", "),
			"Kind=" + X.HyperEdgeKind[this.kind],
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
}


/**
 * 
 */
export enum HyperEdgeKind
{
	/**
	 * Indicates that the HyperEdge has a predecessor,
	 * but no successors could be found. 
	 */
	orphan,
	/**
	 * Indicates that the HyperEdge's predecessor Node was
	 * connected to various successor Nodes as a result of an
	 * exact string match.
	 */
	literal,
	/**
	 * Indicates that the HyperEdges's precedessor Node
	 * was connected to various successor Nodes as a result
	 * of the textualValue of one of the predecessor Node's 
	 * annotation spans matching a (total or partial) pattern
	 * defined by the successor Node.
	 */
	categorical,
	/**
	 * Indicates that the HyperEdges's precedessor Node
	 * was connected to various successor Nodes as a result
	 * of the rawTextualValue of one of the predecessor Node's 
	 * annotation spans matching a total pattern defined by the
	 * successor Node.
	 */
	summation,
	/**
	 * Not implemented.
	 */
	categoricalOverlay,
	/**
	 * Not implemented.
	 */
	summationOverlay
}




















/**
 * A Fan connects origin Nodes to target Nodes, for a
 * specific reason, identified by the "rationale" field.
 * 
 * Each Fan object is always "owned" by one single Node
 * object, however, Nodes have a reference to the Fans
 * that are targeting them through their Node.inbounds
 * field.
 */
export class Fan2
{
	/** @internal */
	constructor(
		origin: X.Node,
		/**
		 * Stores all possible Nodes to which the origin may be connected
		 * through this FanTargets must be an array, rather than a single
		 * node, because the graph representation needs to support
		 * the ability for following processes to perform contextual type
		 * resolution.
		 */
		targets: ReadonlyArray<X.Node>,
		sources: ReadonlyArray<X.Span | X.InfixSpan>,
		sum: string,
		rationale: FanRationale)
	{
		if (sources.length === 0)
			throw X.Exception.invalidArgument();
		
		if (rationale === X.FanRationale.sum)
		{
			// All spans sent in are expected to be
			// contained by the same statement.
			if (new Set(sources.map(decl => decl.statement)).size !== 1)
				throw X.Exception.invalidArgument();
			
			this.name = sources[0].statement.sum;
		}
		else this.name = sources[0].boundary.subject.toString();
		
		this.origin = origin;
		this._targets = targets.slice();
		this.sources = new Set(sources);
		this.sum = sum;
		this._rationale = rationale;
	}
	
	/** */
	readonly origin: X.Node;
	
	/**
	 * Stores a string representation of the subjects
	 * contained by the spans that this Fan represents.
	 * In the case when the FanRationale is a sum, the
	 * field instead stores the raw annotation-side
	 * content as it appears in the document.
	 */
	readonly name: string;
	
	/**
	 * Gets an array containing the Nodes to which the origin is 
	 * connected.
	 * 
	 * QUESTION: If the array is empty, what does that means?
	 * Does the fan refer to an orphan? Or is something broken?
	 */
	get targets()
	{
		return X.HigherOrder.copy(this._targets);
	}
	private readonly _targets: X.Node[] = [];
	
	/** */
	get rationale()
	{
		return this._rationale;
	}
	private _rationale: FanRationale;
	
	/**
	 * Stores an array of Spans or InfixSpans that compose the Fan.
	 * These "sources" are built from annotations that are present
	 * in (potentially) multiple statements, either at the statement 
	 * level or the infix level.
	 * 
	 * In the case when the "rationale" of this Fan is "sum", this
	 * array is empty.
	 */
	readonly sources: Set<X.Span | X.InfixSpan>;
	
	/**
	 * Stores the "sum" of the statement that corresponds to
	 * this Fan, or an empty string when the "rationale" of this
	 * Fan is not "sum".
	 */
	readonly sum: string;
	
	/** */
	toString()
	{
		return [
			"Origin=" + this.origin.uri.toString(false, true),
			"Name=" + this.name,
			"Targets=" + this.targets.map(n => n.uri.toString(false, true)),
			"Rationale=" + FanRationale[this.rationale],
			"Sources=" + Array.from(this.sources).map(src => 
				src.boundary.subject).join(", ")
		].join("\n");
	}
}


/**
 * An enumeration that describes why a Fan was
 * created to connect a Node to a series of others.
 */
export enum FanRationale
{
	/**
	 * Indicates that the Fan was created, but doesn't actually connect
	 * anything, due to an inability to resolve an annotation to a
	 * meaningful place in the document.
	 */
	orphan,
	
	/**
	 * Indicates that the Fan was created to connect an origin Node to
	 * other Nodes through a type relationship (meaning an exact name
	 * match).
	 */
	type,
	
	/**
	 * Indicates that the Fan was created to connect an origin Node to
	 * other Nodes through a partial or total pattern. In the case when
	 * the connection is as a result of a total pattern, the source is
	 * guaranteed to be *alone* in it's annotation set.
	 */
	pattern,
	
	/**
	 * Indicates that the Fan was created to connect an origin Node to
	 * target Nodes, as a result of the sum of the statement that contains
	 * one of the target nodes.
	 * 
	 * A Sum is a serialized representation of a series of annotations
	 * that are all present within a single statement. It is used to handle
	 * the case that given a statement in the form "A : B, C, D", the 
	 * annotation "B, C, D" may actually be matchable by a total pattern.
	 */
	sum
}	
