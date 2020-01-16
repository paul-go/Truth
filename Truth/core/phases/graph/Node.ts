
namespace Truth
{
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
			declaration: Span | InfixSpan)
		{
			const span = declaration instanceof Span ?
				declaration : 
				declaration.containingSpan;
			
			this.document = span.statement.document;
			this.stamp = this.document.version;
			
			this._declarations = new Set([declaration]);
			if (this._declarations.size === 0)
				throw Exception.unknownState();
			
			this.subject = declaration.boundary.subject;
			this.name = SubjectSerializer.forInternal(this.subject);
			
			this.isListIntrinsic = 
				this.subject instanceof Term &&
				this.subject.isList;
			
			if (container)
			{
				this.container = container;
				this.phrase = container.phrase.forward(this.subject);
				container._contents.set(this.subject, this);
				
				// This appears to need to be brought back in the case
				// when the code below is uncommented.
				/// return this;
			}
			else
			{
				this.phrase = this.document.phrase.forward(this.subject);
				this.addRootNode(this);
			}
			
			///if (!(declaration instanceof Span))
			///	return this;
			///
			///const term = declaration.boundary.subject;
			///
			///if (!(term instanceof Term))
			///	return this;
			///
			///const containerPattern = (() =>
			///{
			///	for (const decl of this.container.declarations)
			///		if (decl.boundary.subject instanceof Pattern)
			///			return decl.boundary.subject;
			///})();
			///
			///if (!containerPattern)
			///	return this;
			///
			///for (const nfx of containerPattern.getInfixes(InfixFlags.population))
			///	for (const term of nfx.lhs.eachSubject())
			///		if (term.fullName === term.fullName)
			///			//return (this.containerInfix = nfx), this;
			///			return this;
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
					map.delete(this.subject);
			}
			else this.container._contents.delete(this.subject);
			
			for (const ib of this._inbounds)
				ib.removeSuccessor(this);
			
			function recurse(node: Node)
			{
				for (const edge of node._outbounds)
					node.disposeEdge(edge);
				
				for (const containedNode of node._contents.values())
					recurse(containedNode);
				
				// Manual memory management going on here.
				// Clearing out the Sets is probably unnecessary
				// because the GC would catch it anyways, but
				// these calls are here just to be safe.
				// It's still required that we clear out the inbounds
				// from the nodes to which this one is connected.
				node._declarations.clear();
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
		disposeEdge(edge: HyperEdge)
		{
			if (edge.predecessor !== this)
				throw Exception.invalidArgument();
			
			const idx = this._outbounds.indexOf(edge);
			this._outbounds.splice(idx, 1);
			
			for (const scsr of edge.successors)
				scsr.node._inbounds.delete(edge);
			
			edge.clearFragments();
		}
		
		/** */
		readonly container: Node | null = null;
		
		/**
		 * In the case when this node is a direct descendent of a
		 * pattern node, and that pattern has population infixes,
		 * and this node directly corresponds to one of those infixes,
		 * this property gets a reference to said corresponding infix.
		 */
		get containerInfix()
		{
			const flag = InfixFlags.population;
			
			if (this.container !== null)
				if (this.container.subject instanceof Pattern)
					for (const nfx of this.container.subject.getInfixes(flag))
						for (const term of nfx.lhs.eachSubject())
							return nfx;
			
			return null;
		}
		
		/** */
		readonly name: string;
		
		/** */
		readonly subject: Subject;
		
		/** */
		readonly phrase: Phrase;
		
		/** * /
		get uri()
		{
			// Because the URI of the document can change, we need to 
			// make sure it's not hard coded into the node instance.
			const outUri = this.document.sourceUri.extendType(this.typePath);
			
			if (this.lastUri !== null)
				if (outUri.equals(this.lastUri))
					return this.lastUri;
			
			return this.lastUri = outUri;
		}
		
		private lastUri: Uri | null = null;
		private readonly typePath: readonly string[];
		*/
		
		/** Stores the document that contains this Node. */
		readonly document: Document;
		
		/** */
		readonly stamp: VersionStamp;
		
		/**
		 * Stores whether this Node has been explicitly defined as
		 * a list intrinsic.
		 */
		readonly isListIntrinsic: boolean;
		
		/**
		 * Gets whether this Node has been explicitly defined as a list
		 * extrinsic. It is worth noting that this property in and of itself is
		 * not sufficient to determine whether any corresponding type is
		 * actually a list (full type analysis is required to make this conclusion).
		 */
		get isListExtrinsic()
		{
			for (const ob of this.outbounds)
				for (const source of ob.fragments)
					if (source.boundary.subject instanceof Term)
						if (source.boundary.subject.isList)
							return true;
			
			return false;
		}
		
		/**
		 * Gets a reference to the "opposite side of the list".
		 * 
		 * If this Node represents a list intrinsic type, this property gets
		 * a reference to the Node that represents the corresponding
		 * extrinsic side.
		 * 
		 * If this Node represents anything that *isn't* a list intrinsic type,
		 * the property gets a reference to the Node that represents the
		 * corresponding intrinsic side (whether the node is a list or not).
		 * 
		 * Gets null in the case when there is no corresponding list intrinsic
		 * or extrinsic Node to connect.
		 */
		get intrinsicExtrinsicBridge(): Node | null
		{
			if (this.subject instanceof Term)
				for (const adjacent of this.adjacents.values())
					if (adjacent.subject instanceof Term)
						if (adjacent.subject === this.subject)
							if (adjacent.subject.isList !== this.isListIntrinsic)
								return adjacent;
			
			return null;
		}
		
		/**
		 * Stores the set of declaration-side Span instances that
		 * compose this Node. If this the size of this set were to
		 * reach zero, the Node would be marked for deletion.
		 * (Node cleanup uses a reference counted collection
		 * mechanism that uses the size of this set as it's guide).
		 * 
		 * Note that although the type of this field is defined as
		 * "Set<Span | InfixSpan>", in practice, it is either a set
		 * of Span instances, or a set containing one single
		 * InfixSpan instance. This is because it's possible to have
		 * fragments of a type declared in multiple places in
		 * a document, however, InfixSpans can only exist in one
		 * place.
		 */
		get declarations(): ReadonlySet<Span | InfixSpan>
		{
			return this._declarations;
		}
		private readonly _declarations: Set<Span | InfixSpan>;
		
		/** */
		addDeclaration(span: Span | InfixSpan)
		{
			this._declarations.add(span);
		}
		
		/** */
		removeDeclaration(span: Span | InfixSpan)
		{
			const wasDeleted = this._declarations.delete(span);
			if (wasDeleted)
			{
				// Remove all of the annotations that exist on the same
				// statement as the one that contains the declaration that
				// was removed. Note that this won't mess up fragmented
				// types. For example, consider the situation when the first
				// statement is removed from the following document:
				// 
				// A, B : X, Y
				// A, C : X, Y
				// 
				// Statements are removed atomically, so when the statement
				// is removed, this will result in 2 calls to this method: one for
				// the first "A", and one for the "B". When the second call is made,
				// the associated annotations will already have been removed.
				
				for (let i = this._outbounds.length; i-- > 0;)
				{
					const ob = this._outbounds[i];
					
					for (const anno of span.statement.allAnnotations)
						ob.removeFragment(anno);
					
					if (ob.fragments.length === 0)
						this._outbounds.splice(i, 1);
				}
			}
		}
		
		/**
		 * Gets an array containing the statements that
		 * contain this Node.
		 */
		get statements()
		{
			return Object.freeze(
				Array.from(this.declarations)
					.map(decl => decl.statement)
					.filter((v, i, a) => a.indexOf(v) === i));
		}
		
		/**
		 * Gets a readonly map of Nodes that are contained
		 * by this node in the containment hierarchy.
		 */
		get contents(): NodeMap
		{
			return this._contents;
		}
		private readonly _contents = new Map<Subject, Node>();
		
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
			const out = new Map<Subject, Node>();
			for (const [subject, node] of adjacentNodes)
				if (node !== this)
					out.set(subject, node);
			
			return out;
		}
		
		/**
		 * Gets a 2-dimensional array containing the names of
		 * the portability infixes that have been defined within
		 * this node, with the first dimension corresponding to
		 * a unique portability infix, and the second dimension
		 * corresponding to the names defined within that infix.
		 * 
		 * For example, given the following pattern:
		 * /< : A, B, C>< : D, E, F> : ???
		 * 
		 * The following result would be produced:
		 * [["A", "B", "C"], ["D", "E", "F"]]
		 */
		get portabilityTargets()
		{
			if (this._portabilityTargets !== null)
				return this._portabilityTargets;
			
			if (!(this.subject instanceof Pattern))
				return this._portabilityTargets = [];
			
			const termArrays = this.subject
				.getInfixes(InfixFlags.portability)
				.map(nfx => Object.freeze(Array.from(nfx.rhs.eachSubject())
					.map(term => term.textContent)));
			
			return this._portabilityTargets = Object.freeze(termArrays);
		}
		private _portabilityTargets: readonly (readonly string[])[] | null = null;
		
		/**
		 * @returns A set of nodes that are matched by
		 * patterns of adjacent nodes.
		 * 
		 * (Note that this is possible because annotations
		 * that have been applied to a pattern cannot be
		 * polymorphic)
		 */
		getPatternNodesMatching(nodes: Node[])
		{
			const outNodes: Node[] = [];
			
			//
			// This doesn't work because we don't know if
			// a node has been marked as cruft at this point.
			// This method may return junk results in the
			// case when one of the required nodes has
			// been marked as cruft (but then, wouldn't the
			// incoming node also be cruft?)
			//
			
			for (const node of this.adjacents.values())
			{
				if (node.subject instanceof Pattern)
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
		 * (The ordering of inbounds isn't important, as
		 * they have no physical representation in the
		 * document, which is why they're stored in a Set
		 * rather than an array.)
		 */
		get inbounds(): ReadonlySet<HyperEdge>
		{
			return this._inbounds;
		}
		private readonly _inbounds = new Set<HyperEdge>();
		
		/**
		 * Gets an array of HyperEdges that connect this Node to
		 * others, being either adjacents, or Nodes that
		 * exists somewhere in the containment hierarchy.
		 */
		get outbounds(): readonly HyperEdge[]
		{
			return this._outbounds;
		}
		private readonly _outbounds: HyperEdge[] = [];
		
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
				if (edge.fragments.length === 1)
					return;
			}
			
			const edgeLookup = new Map<HyperEdge, [Statement, number]>();
			
			for (const edge of this._outbounds)
			{
				for (const src of edge.fragments.values())
				{
					const smt = src.statement;
					const lineNum = smt.document.getLineNumber(smt);
					const existingTuple = edgeLookup.get(edge);
					
					if (existingTuple !== undefined)
					{
						const existingStmt = existingTuple[0];
						const existingStmtLineNum = existingTuple[1];
						
						if (lineNum < existingStmtLineNum)
						{
							existingTuple[0] = existingStmt;
							existingTuple[1] = existingStmtLineNum;
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
				
				const obs = this._outbounds;
				
				if (tupleA === undefined || tupleB === undefined)
					throw Exception.unknownState();
				
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
				{
					throw Exception.unknownState();
				}
				
				const annos = smtA.annotations;
				const findMinIndex = (edge: HyperEdge) =>
				{
					let minIdx = Infinity;
					
					for (const src of edge.fragments)
					{
						if (src instanceof InfixSpan)
							throw Exception.unknownState();
						
						const idx = annos.indexOf(src);
						if (idx < minIdx)
							minIdx = idx;
					}
					
					if (minIdx === Infinity)
						throw Exception.unknownState();
					
					return minIdx;
				};
				
				const edgeAIdx = findMinIndex(edgeA);
				const edgeBIdx = findMinIndex(edgeB);
				return edgeAIdx - edgeBIdx;
			});
		}
		
		/**
		 * @internal
		 * Adds a new edge to the node, or updates an existing one with
		 * a new fragment.
		 * 
		 * If no edge exists for the new fragment, a new one is created.
		 */
		addEdgeFragment(fragment: Span | InfixSpan)
		{
			const term = fragment.boundary.subject;
			if (!(term instanceof Term))
				throw Exception.unknownState();
			
			// If the input source is "alone", it means that it refers to
			// a statement-level annotation that has no other annotations
			// beside it (e.g. in an annotation structure looking like "D: A1, A2")
			// This is relevant, because if the source is alone, it also needs
			// to be compared against any visible total patterns.
			const sourceIsAlone =
				fragment instanceof Span && 
				fragment.statement.annotations.length === 1;
			
			/**
			 * Adds an edge to it's two applicable successor nodes.
			 */
			const append = (edge: HyperEdge) =>
			{
				this._outbounds.push(edge);
				
				for (const suc of edge.successors)
					suc.node._inbounds.add(edge);
			};
			
			// If there is already an existing outbound HyperEdge, we can
			// add the new Span to the edge's list of Spans, and quit.
			// This works whether the edge is for a type or pattern.
			const existingEdge = this._outbounds.find(edge =>
			{
				return edge.term.singular === term.singular;
			});
			
			if (existingEdge)
			{
				existingEdge.addFragment(fragment);
			}
			else
			{
				const successors: Successor[] = [];
				
				for (const level of this.enumerateContainment())
				{
					const successorNode = 
						level.container !== null && 
						level.container !== this &&
						level.container.subject === term ?
							level.container :
							level.adjacents.get(term);
					
					if (successorNode !== undefined)
					{
						successors.push(new Successor(
							successorNode,
							level.longitudeDelta));
						
						// There should only ever be a single successor in the case when
						// the node is a pattern node, because the annotations (which
						// are eventually become bases) of these nodes do not have
						// polymorphic behavior.
						if (this.subject instanceof Pattern)
							break;
					}
				}
				
				append(new HyperEdge(this, fragment, successors));
			}
			
			// 
			// Refresh the sums before quitting.
			// 
			
			///const sumEdgeForInputSpanIdx = this._outbounds.findIndex(edge => 
			///{
			///	if (edge.kind === HyperEdgeKind.summation)
			///		for (const src of edge.sources)
			///			return src.statement === smt;
			///	
			///	return false;
			///});
			///
			///if (sumEdgeForInputSpanIdx > -1)
			///	this._outbounds.splice(sumEdgeForInputSpanIdx, 1);
			///
			///if (!sourceIsAlone)
			///	for (const { longitudeDelta, adjacents } of this.enumerateContainment())
			///		for (const adjacentNode of adjacents.values())
			///			if (adjacentNode.subject instanceof Pattern)
			///				if (adjacentNode.subject.isTotal)
			///					if (adjacentNode.subject.test(smt.sum))
			///						append(new HyperEdge(
			///							this,
			///							smt.sum,
			///							[new Successor(
			///								adjacentNode,
			///								longitudeDelta)],
			///							HyperEdgeKind.summation));
		}
		
		/**
		 * 
		 */
		addEdgeSuccessor(successorNode: Node)
		{
			const term = successorNode.subject as Term;
			if (!(term instanceof Term))
				throw Exception.unknownState();
			
			for (const ob of this.outbounds)
			{
				if (ob.term !== successorNode.subject)
					continue;
				
				const scsrLong = successorNode.phrase.length;
				const predLong = ob.predecessor.phrase.length;
				ob.addSuccessor(successorNode, predLong - scsrLong);
				successorNode._inbounds.add(ob);
			}
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
			let currentLevel: Node | null = this;
			let longitudeCount = 0;
			
			do
			{
				yield {
					sourceDocument: this.document,
					container: currentLevel as Node | null,
					adjacents: currentLevel.adjacents,
					longitudeDelta: longitudeCount++
				};
			}
			while ((currentLevel = currentLevel.container) !== null);
			
			for (const doc of this.document.traverseDependencies())
			{
				yield {
					sourceDocument: doc,
					container: null,
					adjacents: this.getRootNodes(doc),
					longitudeDelta: longitudeCount
				};
			}
		}
		
		/**
		 * @returns An array that stores the containment hierarchy
		 * of the Nodes present in this Node's containing document,
		 * yielding each containerof this Node.
		 */
		get containment()
		{
			if (this._containment !== null)
				return this._containment;
			
			const nodes: Node[] = [];
			
			let currentLevel: Node | null = this;
			while ((currentLevel = currentLevel.container) !== null)
				nodes.push(currentLevel);
			
			return this._containment = Object.freeze(nodes);
		}
		private _containment: readonly Node[] | null = null;
		
		/** */
		removeEdgeSource(src: Span | InfixSpan)
		{
			for (let i = this._outbounds.length; --i > 0;)
				this._outbounds[i].removeFragment(src);
		}
		
		/** */
		toString(includePath = true)
		{
			const decls = Array.from(this.declarations);
			const spans = decls.filter((s): s is Span => s instanceof Span);
			const anchors = decls.filter((a): a is InfixSpan => a instanceof InfixSpan);
			
			const spansText = spans.map(s => SubjectSerializer.forInternal(s)).join(", ");
			const anchorText = anchors.map(a => SubjectSerializer.forInternal(a)).join(", ");
			
			const ob = this.outbounds.length;
			const ib = this.inbounds.size;
			const path = includePath ? this.phrase.toString() + " " : "";
			
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
				"\n\tOuts:\n" + obsVerbose.join("\n\n") +
				"\n\tIns:\n" + ibsVerbose.join("\n\n");
			
			return simple + verbose;
		}
		
		/** */
		private addRootNode(node: Node)
		{
			const existingSet = Node.rootNodes.get(node.document);
			if (existingSet)
			{
				existingSet.set(node.subject, node);
			}
			else
			{
				const map = new Map<Subject, Node>();
				map.set(node.subject, node);
				Node.rootNodes.set(node.document, map);
			}
		}
		
		/** */
		private removeRootNode(node: Node)
		{
			const existingSet = Node.rootNodes.get(node.document);
			if (existingSet)
			{
				existingSet.delete(node.subject);
				
				// This is somewhat redundant as the set
				// is likely going to be GC'd away anyway in
				// this case. It's here for completeness sake.
				if (existingSet.size === 0)
					Node.rootNodes.delete(node.document);
			}
		}
		
		/** */
		private getRootNodes(fromDocument?: Document)
		{
			const fromDoc = fromDocument || this.document;
			const out = Node.rootNodes.get(fromDoc) || new Map<Subject, Node>();
			return HigherOrder.copy(out);
		}
		
		/** */
		private static rootNodes = new WeakMap<Document, Map<Subject, Node>>();
	}

	type NodeMap = ReadonlyMap<Subject, Node>;
}
