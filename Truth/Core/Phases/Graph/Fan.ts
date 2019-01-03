import * as X from "../../X";


/**
 * A Fan connects origin Nodes to target Nodes, for a
 * specific reason, identified by the "rationale" field.
 * 
 * Each Fan object is always "owned" by one single Node
 * object, however, Nodes have a reference to the Fans
 * that are targeting them through their Node.inbounds
 * field.
 */
export class Fan
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
