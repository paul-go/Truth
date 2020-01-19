
namespace Truth
{
	/**
	 * @internal
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
			 * occurence of "Bar".
			 */
			readonly predecessor: Node,
			source: Span | InfixSpan,
			successors: readonly Successor[])
		{
			if (!(source.boundary.subject instanceof Term))
				throw Exception.unknownState();
			
			const successorNodes = successors
				.map(scsr => scsr.node)
				.filter((v, i, a) => a.indexOf(v) === i);
			
			if (successorNodes.length !== successors.length)
				throw Exception.unknownState();
			
			this.term = source.boundary.subject;
			this._fragments = [source];
			this._successors = successors.slice();
		}
		
		/**
		 * Attempts to add another fragment to the HyperEdge.
		 * Reports a fault instead in the case when there is a 
		 * list conflict between the source provided and the
		 * existing sources. (I.e. one of the sources is defined
		 * as a list, and another is not).
		 */
		addFragment(fragment: Span | InfixSpan)
		{
			///const isPattern = this.predecessor.subject instanceof Pattern;
			///const isInfix = source instanceof InfixSpan;
			///if (isPattern !== isInfix)
			///	throw Exception.invalidCall();
			
			if (this._fragments.includes(fragment))
				return;
			
			//! The ordering of the sources is not being handled here.
			
			this._fragments.push(fragment);
		}
		
		/**
		 * Removes the specified annotation-side Span or InfixSpan
		 * from this edge.
		 */
		removeFragment(fragment: Span | InfixSpan)
		{
			const fragPos = this._fragments.indexOf(fragment);
			if (fragPos >= 0)
				this._fragments.splice(fragPos, 1);
		}
		
		/** */
		clearFragments()
		{
			this._fragments.length = 0;
		}
		
		/**
		 * Gets the set of annotation-side Spans or annotation-side
		 * InfixSpans that are responsible for the conception of this
		 * HyperEdge.
		 * 
		 * The array contains either Span instances or InfixSpan instances,
		 * but never both. In the case when the array stores Span instances,
		 * the location of those Spans are potentially scattered across many
		 * statements.
		 */
		get fragments(): readonly (Span | InfixSpan)[]
		{
			return this._fragments;
		}
		private readonly _fragments: (Span | InfixSpan)[];
		
		/**
		 * 
		 */
		addSuccessor(node: Node, longitude: number)
		{
			if (!this._successors.find(scsr => scsr.node === node))
				this._successors.push(new Successor(node, longitude));
		}
		
		/**
		 * 
		 */
		removeSuccessor(node: Node)
		{
			for (let i = this._successors.length; i-- > 0;)
				if (this._successors[i].node === node)
					this._successors.splice(i, 1);
		}
		
		/**
		 * Stores all possible success Nodes to which the predecessor 
		 * Node is preemptively connected via this HyperEdge. The 
		 * connection is said to be preemptive, because the connection
		 * might be ignored during polymorphic name resolution.
		 */
		get successors(): readonly Successor[]
		{
			return this._successors;
		}
		private readonly _successors: Successor[];
		
		/**
		 * Gets whether this HyperEdge has no immediately resolvable
		 * successors. This means that the subject being referred to by
		 * this HyperEdge is either a type alias which will be matched by
		 * a pattern, or just a plain old fault.
		 */
		get isDangling()
		{
			return this.successors.length === 0;
		}
		
		/**
		 * Gets a value that indicates whether the sources of the edge
		 * causes incrementation of the list dimensionality of the type
		 * that corresponnds to this HyperEdge's predecessor Node.
		 * 
		 * (Note that all sources need to agree on this value, and the 
		 * necessary faults are generated to ensure that this is always
		 * the case.)
		 */
		get isList()
		{
			for (const source of this.fragments)
			{
				const sub = source.boundary.subject;
				return sub instanceof Term && sub.isList;
			}
			
			return false;
		}
		
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
		readonly term: Term;
		
		/**
		 * Gets a value that indicates the specific part of the
		 * predecessor where this HyperEdge begins.
		 */
		get predecessorOrigin(): HyperEdgeOrigin
		{
			//! Is this still necessary?
			
			if (this._fragments.length === 0)
				throw Exception.unknownState();
			
			const src = this._fragments[0];
			if (src instanceof Span)
				return HyperEdgeOrigin.statement;
			
			if (src.containingInfix.isPortability)
				return HyperEdgeOrigin.portabilityInfix;
			
			if (src.containingInfix.isPopulation)
				return HyperEdgeOrigin.populationInfix;
			
			if (src.containingInfix.isPattern)
				return HyperEdgeOrigin.patternInfix;
			
			throw Exception.unknownState();
		}
		
		/**
		 * @returns A string representation of this HyperEdge,
		 * suitable for debugging and testing purposes.
		 */
		toString()
		{
			const print = (sub: Subject) => SubjectSerializer.forInternal(sub);
			
			return [
				"Value=" + this.term,
				"Predecessors=" + print(this.predecessor.subject),
				"Successors=" + this.successors
					.map(n => print(n.node.subject) + " << " + n.longitude)
					.join(", "),
				"Sources=" + Array.from(this.fragments)
					.map(src => src.boundary.subject).join(", "),
				"---"
			].join("\n");
		}
	}
	
	/**
	 * @internal
	 */
	export class Successor
	{
		constructor(
			readonly node: Node,
			/**
			 * The the number of levels of depth in the containment
			 * hierarchy that need to be crossed in order for the containing
			 * HyperEdge to be established between the predecessor and
			 * this successor.
			 */
			readonly longitude: number)
		{ }
		
		readonly stamp = VersionStamp.next();
	}
	
	/**
	 * @internal
	 * Indicates the place in a statement where a HyperEdge starts.
	 * (HyperEdges can start either at the statement level, or within
	 * various kinds of infixes.)
	 */
	export enum HyperEdgeOrigin
	{
		statement,
		populationInfix,
		portabilityInfix,
		patternInfix
	}
}
