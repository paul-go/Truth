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
		targets: ReadonlyArray<X.Node>,
		sources: ReadonlyArray<X.Span | X.InfixSpan>,
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
		else this.name = sources[0].subject.toString();
		
		this.origin = origin;
		this._targets = targets.slice();
		this.sources = new Set(sources);
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
	 * Stores an array of Spans or Anchors that compose the Fan.
	 * These "sources" are built out of subjects that exist on the
	 * annotation-side, either at the statement or the infix level.
	 * 
	 * In the case when the "rationale" of this Fan is "patternSum",
	 * this array is composed of a complete set of spans on the
	 * annotation side of a single statement. In other cases, the
	 * array is composed of Spans potentially scattered
	 * throughout the document across many statements.
	 */
	readonly sources: Set<X.Span | X.InfixSpan>;
	
	/** */
	toString()
	{
		return [
			"Origin=" + this.origin.uri.toString(false, true),
			"Name=" + this.name,
			"Targets=" + this.targets.map(n => n.uri.toString(false, true)),
			"Rationale=" + FanRationale[this.rationale],
			"Sources=" + Array.from(this.sources).map(src => src.subject).join(", ")
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
