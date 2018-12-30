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
		spans: ReadonlyArray<X.Span>,
		rationale: FanRationale)
	{
		if (spans.length === 0)
			throw X.Exception.invalidArgument();
		
		if (rationale === X.FanRationale.sum)
		{
			// All spans sent in are expected to be
			// contained by the same statement.
			if (new Set(spans.map(span => span.statement)).size !== 1)
				throw X.Exception.invalidArgument();
			
			this.name = spans[0].statement.getAnnotationContent();
		}
		else this.name = spans[0].subject.toString();
		
		this.origin = origin;
		this._targets = targets.slice();
		this.spans = new Set(spans);
		this._rationale = rationale;
	}
	
	/**
	 * Stores a string representation of the subjects
	 * contained by the spans that this Fan represents.
	 * In the case when the FanRationale is a sum, the
	 * field instead stores the raw annotation-side
	 * content as it appears in the document.
	 */
	readonly name: string;
	
	/** */
	readonly origin: X.Node;
	
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
	 * Gets an array of annotation-side Span objects that compose
	 * the Fan. In the case when the "rationale" of this Fan is "patternSum",
	 * this array is composed of a complete set of spans on the annotation
	 * side of a single statement. In other cases, the array is composed of
	 * Spans potentially scattered throughout the document across many
	 * statements.
	 */
	readonly spans: Set<X.Span>;
}


/**
 * An enumeration that describes why a Fan was
 * created to connect a Node to a series of others.
 */
export enum FanRationale
{
	/**
	 * Indicates that the Fan was created, but doesn't
	 * actually connect anything, due to an inability
	 * to resolve an annotation to a meaningful place
	 * in the document.
	 */
	orphan,
	
	/**
	 * Indicates that the Fan was created to connect
	 * an origin Node to other Nodes through a type
	 * relationship (meaning an exact name match).
	 */
	type,
	
	/**
	 * Indicates that the Fan was created to connect
	 * an origin Node to other Nodes through a pattern
	 * with the coexistence flag set.
	 */
	pattern,
	
	/**
	 * Indicates that the Fan was created to connect
	 * and origin Node to other Nodes through a "sum"
	 * pattern (a pattern without the coexistence flag set).
	 * 
	 * A Sum is a serialized representation of a series of annotations
	 * that are all present within a single statement. It is used to handle
	 * the case that given a statement in the form "A : B, C, D", the 
	 * annotation "B, C, D" may actually be matchable by a pattern
	 * without a coexistence flag. Sums allow these potential matches
	 * to be processed more easily.
	 */
	sum,
	
	/**
	 * 
	 */
	infix
	
}	
