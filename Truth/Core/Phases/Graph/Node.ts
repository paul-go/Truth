import * as X from "../../X";


/**
 * A class that represents a single Node contained within
 * the Program's Graph. Nodes are long-lived, referentially
 * significant objects that persist between edit frames.
 * 
 * Nodes are connected in a graph not by edges, but by
 * HyperEdges. A HyperEdge (from graph theory) is similar 
 * to a directed edge in that it has a single predecessor,
 * but differs in that it has multiple successors.
 * 
 * It is necessary for Nodes to be connected to each other
 * in this way, in order for further phases in the pipeline
 * to execute the various kinds of polymorphic type
 * resolution.
 */
export class Node
{
	/** @internal */
	constructor(
		container: Node | null,
		declaration: X.Span | X.InfixSpan)
	{
		const span = declaration instanceof X.Span ?
			declaration : 
			declaration.containingSpan;
		
		this.container = container;
		this.document = span.statement.document;
		this.stamp = this.document.version;
		this.declarations = new Set([declaration]);
		this.subject = declaration.boundary.subject;
		this.name = this.subject.toString();
		
		const containerTypePath = (() =>
		{
			if (container === null)
				return [];
			
			return Array.from(container.enumerateContainers())
				.reverse()
				.map(n => n.name);
		})();
		
		const typePath = containerTypePath.concat(this.name);
		this.uri = this.document.sourceUri.extend([], typePath);
		
		if (this.declarations.size === 0)
			throw X.Exception.unknownState();
		
		if (this.container)
			this.container._contents.set(this.name, this);
		else
			this.addRootNode(this);
	}
	
	/**
	 * Removes this Node, and all its contents from the graph.
	 */
	dispose()
	{
		if (this.container === null)
		{
			const map = Node.rootNodes.get(this.document);
			if (map)
				map.delete(this.name);
		}
		else this.container._contents.delete(this.name);
		
		const recurse = (node: Node) =>
		{
			for (const edge of node._outbounds)
				this.disposeEdge(edge);
			
			for (const node of this._contents.values())
				recurse(node);
			
			// Manual memory management going on here.
			// Clearing out the Sets is probably unnecessary
			// because the GC would catch it anyways, but
			// these calls are here just to be safe.
			// It's still required that we clear out the inbounds
			// from the nodes to which this one is connected.
			node.declarations.clear();
			node._inbounds.clear();
		}
		
		recurse(this);
	}
	
	/**
	 * Removes the specified HyperEdge from this Node's
	 * set of outbounds.
	 * 
	 * @throws In the case when the specified HyperEdge is
	 * not owned by this Node.
	 */
	disposeEdge(edge: X.HyperEdge)
	{
		if (edge.predecessor !== this)
			throw X.Exception.invalidArgument();
		
		for (const scsr of edge.successors)
			scsr.node._inbounds.delete(edge);
		
		edge.clearSources();
	}
	
	/** */
	readonly container: Node | null;
	
	/** */
	readonly name: string;
	
	/** */
	readonly subject: X.Subject;
	
	/** */
	readonly uri: X.Uri;
	
	/** Stores the document that contains this Node. */
	readonly document: X.Document;
	
	/** */
	readonly stamp: X.VersionStamp;
	
	/**
	 * Stores the set of declaration-side Span objects that
	 * compose this Node. If this the size of this set were to
	 * reach zero, the Node would be marked for deletion.
	 * (Node cleanup uses a reference counted collection
	 * mechanism that uses the size of this set as it's guide).
	 * 
	 * Note that although the type of this field is defined as
	 * "Set<Span | Anchor>", in practice, it is either a set of
	 * multiple Span objects, or a set containing one single
	 * Anchor object. This is because it's possible to have
	 * fragments of a type declared in multiple places in
	 * a document, however, Anchors (which are references
	 * to declarations within an Infix) can only exist in one
	 * place.
	 */
	readonly declarations: Set<X.Span | X.InfixSpan>;
	
	/**
	 * Gets a readonly map of Nodes that are contained
	 * by this node in the containment hierarchy.
	 */
	get contents(): NodeMap
	{
		return X.HigherOrder.copy(this._contents);
	}
	private readonly _contents = new Map<string, X.Node>();
	
	/**
	 * Gets a readonly name of Nodes that are adjacent
	 * to this Node in the containment hierarchy.
	 */
	get adjacents(): NodeMap
	{
		const adjacentNodes = this.container ?
			this.container.contents :
			this.getRootNodes();
		
		// Filter this node out of the result set, because
		// Nodes cannot be adjacent to themselves.
		const out = new Map<string, Node>();
		for (const [name, node] of adjacentNodes)
			if (node !== this)
				out.set(name, node);
		
		return out;
	}
	
	/**
	 * Gets the names of the identifiers referenced
	 * as portability targets in the infixes of the Node.
	 * If the Node's subject is not a pattern, this property
	 * is an empty array.
	 */
	get portabilityTargets()
	{
		if (!(this.subject instanceof X.Pattern))
			return [];
		
		const identifierArrays = this.subject
			.getInfixes(X.InfixFlags.portability)
			.map(nfx => Array.from(nfx.rhs.eachSubject()));
		
		if (identifierArrays.length === 0)
			return [];
		
		return (<X.Identifier[]>[])
			.concat(...identifierArrays)
			.map(ident => ident.toString());
	}
	
	/**
	 * @returns A set of nodes that are matched by
	 * patterns of adjacent nodes.
	 * 
	 * (Note that this is possible because annotations
	 * that have been applied to a pattern cannot be
	 * polymorphic)
	 */
	getPatternNodesMatching(nodes: X.Node[])
	{
		const outNodes: X.Node[] = [];
		
		//
		// This doesn't work because we don't know if
		// a node has been marked as cruft at this point.
		// This method may return junk results in the
		// case when one of the required nodes has
		// been marked as cruft (but then, wouldn't the
		// incoming node also be cruft?)
		//
		
		for (const [name, node] of this.adjacents)
		{
			if (node.subject instanceof X.Pattern)
			{
				const unorphaned = node.outbounds
					.filter(ob => ob.successors.length > 0)
					.map(ob => ob.successors[0].node);
				
				if (unorphaned.length === 0)
					continue;
				
				if (unorphaned.length === nodes.length)
					if (unorphaned.every(node => nodes.includes(node)))
						outNodes.push(...unorphaned);
			}
		}
		
		return outNodes;
	}
	
	/**
	 * Gets an immutable set of HyperEdges from adjacent
	 * or contained Nodes that reference this Node. 
	 * 
	 * (The ordering of outbounds isn't important, as
	 * they have no physical representation in the
	 * document, which is why they're stored in a Set
	 * rather than an array.)
	 */
	get inbounds()
	{
		return X.HigherOrder.copy(this._inbounds);
	}
	private readonly _inbounds = new Set<X.HyperEdge>();
	
	/**
	 * Gets an array of HyperEdges that connect this Node to
	 * others, being either adjacents, or Nodes that
	 * exists somewhere in the containment hierarchy.
	 */
	get outbounds()
	{
		return X.HigherOrder.copy(this._outbounds);
	}
	private readonly _outbounds: X.HyperEdge[] = [];
	
	/**
	 * @internal
	 * Sorts the outbound HyperEdges, so that they're ordering
	 * is consistent with the way their corresponding
	 * annotations appear in the underlying document.
	 */
	sortOutbounds()
	{
		if (this._outbounds.length === 0)
			return;
		
		if (this._outbounds.length === 1)
		{
			const edge = this._outbounds[0];
			if (edge.sources.length === 1)
				return;
		}
		
		const edgeLookup = new Map<X.HyperEdge, [X.Statement, number]>();
		
		for (const edge of this._outbounds)
		{
			for (const src of edge.sources.values())
			{
				const smt = src.statement;
				const lineNum = smt.document.getLineNumber(smt);
				const existingTuple = edgeLookup.get(edge);
				
				if (existingTuple !== undefined)
				{
					const existingStmt = existingTuple[0];
					const existingStmtIdx = existingTuple[1];
					
					if (lineNum < existingStmtIdx)
					{
						existingTuple[0] = existingStmt;
						existingTuple[1] = existingStmtIdx;
					}
				}
				else
				{
					edgeLookup.set(edge, [smt, lineNum]);
				}
			}
		}
		
		// Sort the output edges in the array, so that the sorting of
		// the array aligns with the appearance of the underlying
		// spans in the document.
		this._outbounds.sort((edgeA, edgeB) =>
		{
			const tupleA = edgeLookup.get(edgeA);
			const tupleB = edgeLookup.get(edgeB);
			
			if (tupleA === undefined || tupleB === undefined)
				throw X.Exception.unknownState();
			
			const [smtA, smtIdxA] = tupleA;
			const [smtB, smtIdxB] = tupleB;
			
			// If the top-most span of the predecessors of
			// the edges are located in different statements,
			// a simple comparison of the statement indexes
			// is possible.
			if (smtIdxA < smtIdxB)
				return -1;
			
			if (smtIdxB < smtIdxA)
				return 1;
			
			// At this point, statement A and statement B 
			// are actually equal.
			if (smtA !== smtB)
				throw X.Exception.unknownState();
			
			const annos = smtA.annotations;
			const findMinIndex = (edge: X.HyperEdge) =>
			{
				let minIdx = Infinity;
				
				for (const src of edge.sources)
				{
					if (src instanceof X.InfixSpan)
						throw X.Exception.unknownState();
					
					const idx = annos.indexOf(src);
					if (idx < minIdx)
						minIdx = idx;
				}
				
				if (minIdx === Infinity)
					throw X.Exception.unknownState();
				
				return minIdx;
			}
			
			const edgeAIdx = findMinIndex(edgeA);
			const edgeBIdx = findMinIndex(edgeB);
			return edgeAIdx - edgeBIdx;
		});
	}
	
	/**
	 * @internal
	 */
	addEdgeSource(source: X.Span | X.InfixSpan)
	{
		const value = source.boundary.subject.toString();
		const smt = source.statement;
		
		// If the input source is "alone", it means that it refers to
		// a statement-level annotation that has no other annotations
		// beside it (e.g. in an annotation structure looking like "D: A1, A2")
		// This is relevant, because if the source is alone, it also needs
		// to be compared against any visible total patterns.
		const sourceIsAlone =
			source instanceof X.Span && 
			source.statement.annotations.length === 1;
		
		/**
		 * Adds a edge to it's two applicable successor nodes.
		 */
		const append = (edge: X.HyperEdge) =>
		{
			this._outbounds.push(edge);
			
			for (const suc of edge.successors)
				suc.node._inbounds.add(edge);
		}
		
		// If there is already an existing outbound HyperEdge, we can
		// add the new Span to the edge's list of Spans, and quit.
		// This works whether the edge is for a type or pattern.
		const existingEdge = this._outbounds.find(edge => edge.textualValue === value);
		if (existingEdge)
		{
			existingEdge.addSource(source);
		}
		else
		{
			const successors: X.Successor[] = [];
			
			for (const { longitudeDelta, adjacents } of this.enumerateContainment())
			{
				const adjacentNode = adjacents.get(source.boundary.subject.toString());
				if (adjacentNode)
				{
					successors.push(new X.Successor(
						adjacentNode,
						longitudeDelta));
				}
			}
			
			//if (kind === X.HyperEdgeKind.orphan)
			//{
			//	for (const { longitudeDelta, adjacents } of this.enumerateContainment())
			//		for (const adjacentNode of adjacents.values())
			//			if (adjacentNode.subject instanceof X.Pattern)
			//				if (sourceIsAlone || !adjacentNode.subject.isTotal)
			//					if (adjacentNode.subject.test(value))
			//						successors.push(new X.Successor(
			//							adjacentNode, 
			//							longitudeDelta));
			//	
			//	if (successors.length > 0)
			//		kind = X.HyperEdgeKind.categorical;
			//}
			
			append(new X.HyperEdge(this, source, successors));
		}
		
		// 
		// Refresh the sums before quitting.
		// 
		
		//const sumEdgeForInputSpanIdx = this._outbounds.findIndex(edge => 
		//{
		//	if (edge.kind === X.HyperEdgeKind.summation)
		//		for (const src of edge.sources)
		//			return src.statement === smt;
		//	
		//	return false;
		//});
		//
		//if (sumEdgeForInputSpanIdx > -1)
		//	this._outbounds.splice(sumEdgeForInputSpanIdx, 1);
		//
		//if (!sourceIsAlone)
		//	for (const { longitudeDelta, adjacents } of this.enumerateContainment())
		//		for (const adjacentNode of adjacents.values())
		//			if (adjacentNode.subject instanceof X.Pattern)
		//				if (adjacentNode.subject.isTotal)
		//					if (adjacentNode.subject.test(smt.sum))
		//						append(new X.HyperEdge(
		//							this,
		//							smt.sum,
		//							[new X.Successor(adjacentNode, longitudeDelta)],
		//							X.HyperEdgeKind.summation));
	}
	
	/**
	 * 
	 */
	private enumerateOutbounds()
	{
		//const recurse = (node: X.Node) =>
		//{
		//	for (const edge of node.outbounds)
		//		for (const successor of edge.successors)
		//			//yield { node: 
		//}
		//
		//yield* recurse(this);
	}
	
	/**
	 * Enumerates upwards through the containment
	 * hierarchy of the Nodes present in this Node's
	 * containing document, yielding the adjacents at
	 * every level, and then continues through to the
	 * root level adjacents of each of the document's
	 * dependencies.
	 */
	*enumerateContainment()
	{
		const doc = this.document;
		const program = doc.program;
		const deps = program.documents.getDependencies(doc);
		let currentLevel: Node | null = this;
		let longitudeCount = 0;
		
		do
		{
			yield {
				sourceDocument: doc,
				adjacents: currentLevel.adjacents,
				longitudeDelta: longitudeCount++
			};
		}
		while ((currentLevel = currentLevel.container) !== null);
		
		// NOTE: This is broken. It needs to be recursive.
		
		for (let i = deps.length; --i > 0;)
		{
			const sourceDocument = deps[i];
			
			yield {
				sourceDocument,
				adjacents: this.getRootNodes(sourceDocument),
				longitudeDelta: longitudeCount
			}
		}
	}
	
	/**
	 * Enumerates upwards through the containment
	 * hierarchy of the Nodes present in this Node's
	 * containing document, yielding each container
	 * of this Node.
	 */
	*enumerateContainers()
	{
		let currentLevel: Node | null = this;
		
		do yield currentLevel;
		while ((currentLevel = currentLevel.container) !== null);
	}
	
	/** */
	removeEdgeSource(src: X.Span | X.InfixSpan)
	{
		for (let i = this._outbounds.length; --i > 0;)
			this._outbounds[i].addSource(src);
	}
	
	/** */
	toString(includePath = true)
	{
		const decls = Array.from(this.declarations);
		const spans = decls.filter((s): s is X.Span => s instanceof X.Span);
		const anchors = decls.filter((a): a is X.InfixSpan => a instanceof X.InfixSpan);
		
		const spansText = spans.map(s => s.boundary.subject.toString()).join(", ");
		const anchorText = anchors.map(a => a.boundary.subject.toString()).join(", ");
		
		const ob = this.outbounds.length;
		const ib = this.inbounds.size;
		const path = includePath ? this.uri.typePath.join("/") + " " : "";
		
		const simple = [
			path,
			spansText.length ? "spans=" + spansText : "",
			anchorText.length ? "anchor=" + anchorText : "",
			"out=" + ob,
			"in=" + ib
		].filter(s => s.trim()).join(", ");
		
		const fmt = (str: string) => str.split("\n").map(s => "\t\t" + s).join("\n");
		const obsVerbose = this.outbounds
			.map(ob => fmt(ob.toString()));
		
		const ibsVerbose = Array.from(this.inbounds.values())
			.map(ib => fmt(ib.toString()));
		
		const verbose = 
			"\n\tOuts:\n" + obsVerbose.join("\n\n")+
			"\n\tIns:\n" + ibsVerbose.join("\n\n");
		
		return simple + verbose;
	}
	
	/** */
	private addRootNode(node: Node)
	{
		const existingSet = Node.rootNodes.get(node.document);
		if (existingSet)
		{
			existingSet.set(node.name, node);
		}
		else
		{
			const map = new Map<string, Node>();
			map.set(node.name, node);
			Node.rootNodes.set(node.document, map);
		}
	}
	
	/** */
	private removeRootNode(node: Node)
	{
		const existingSet = Node.rootNodes.get(node.document);
		if (existingSet)
		{
			existingSet.delete(node.name);
			
			// This is somewhat redundant as the set
			// is likely going to be GC'd away anyway in
			// this case. It's here for completeness sake.
			if (existingSet.size === 0)
				Node.rootNodes.delete(node.document);
		}
	}
	
	/** */
	private getRootNodes(fromDocument?: X.Document)
	{
		const fromDoc = fromDocument || this.document;
		const out = Node.rootNodes.get(fromDoc) || new Map<string, Node>();
		return X.HigherOrder.copy(out);
	}
	
	/** */
	private static rootNodes = new WeakMap<X.Document, Map<string, Node>>();
}

type NodeMap = ReadonlyMap<string, Node>;
