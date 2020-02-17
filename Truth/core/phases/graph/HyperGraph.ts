
namespace Truth
{
	/**
	 * @internal
	 * Stores a representation of a Truth program in a graph
	 * format, which lays the foundation for type analysis.
	 */
	export class HyperGraph
	{
		/**
		 * Test-only field used to disable the functions of the Graph.
		 */
		static disabled: boolean | undefined;
		
		/** */
		constructor(private readonly program: Program)
		{
			this.nodeIndex = new NodeIndex();
			
			if (HyperGraph.disabled)
				return;
			
			for (const doc of program.documents)
				this.include(doc);
			
			program.on(CauseDocumentCreate, data =>
			{
				this.include(data.document);
			});
			
			program.on(CauseDocumentDelete, data =>
			{
				this.exclude(data.document);
			});
			
			program.on(CauseInvalidate, data =>
			{
				if (data.parents.length > 0)
				{
					for (const smt of data.parents)
						this.exclude(smt);
				}
				else this.exclude(data.document);
			});
			
			program.on(CauseRevalidate, data =>
			{
				if (data.parents.length > 0)
				{
					for (const smt of data.parents)
						this.include(smt);
				}
				else this.include(data.document);
			});
			
			program.on(CauseEditComplete, data =>
			{
				this.activeTransactions.delete(data.document);
			});
		}
		
		/**
		 * Handles a document-level exclusion, which is the removal 
		 * of a section of Spans within a document, or possibly the
		 * entire document itself.
		 */
		private exclude(root: Document | Statement)
		{
			const { document, iterator } = this.methodSetup(root);
			const txn = this.getTransaction(root);
			const entries = Array.from(iterator);
			
			///const maybeDestabilizedEdges: HyperEdge[] = [];
			
			for (const { statement } of entries)
			{
				for (const declaration of statement.declarations)
				{
					const associatedNodes = new Set(declaration
						.factor()
						.map(spine => Phrase.fromSpine(spine)?.associatedNode)
						.filter((n): n is Node => n instanceof Node));
					
					for (const associatedNode of associatedNodes)
					{
						associatedNode.removeDeclaration(declaration);
						
						if (associatedNode.declarations.size === 0)
							txn.destabilizedNodes.push(associatedNode);
						
						for (const ob of associatedNode.outbounds)
							if (ob.fragments.length === 0)
								txn.destablizedEdges.push(ob);
						
						///for (const ib of associatedNode.inbounds)
						///	maybeDestabilizedEdges.push(ib);
					}
				}
			}
			
			///for (const edge of maybeDestabilizedEdges)
			///	if (edge.successors.every(scsr => txn.destabilizedNodes.includes(scsr.node)))
			///		txn.destablizedEdges.push(edge);
			
			this.activeTransactions.set(document, txn);
		}
		
		/**
		 * Performs a revalidation of the Nodes that correspond to the
		 * input argument.
		 * 
		 * @param root The root object under which which revalidation
		 * should occur. In the case when a Document instance is passed,
		 * all Nodes present within the document are revalidated. In the 
		 * case when a Statement instance is passed, the Nodes that
		 * correspond to the Statement, and all of it's contents are
		 * revalidated.
		 */
		private include(root: Document | Statement)
		{
			const { document, iterator } = this.methodSetup(root);
			const txn = this.getTransaction(document);
			const phraseSpansMap = new MultiMap<Phrase, (Span | InfixSpan)>();
			
			for (const { statement } of iterator)
			{
				for (const decl of statement.declarations)
				{
					for (const spine of decl.factor())
					{
						const phrase = Phrase.fromSpine(spine);
						if (!phrase)
							continue;
						
						phraseSpansMap.add(phrase, decl);
						
						// If the declaration has population infixes, these
						// need to be added to the map as though they
						// were regular declarations.
						for (const popInfix of decl.infixes.filter(nfx => nfx.isPopulation))
							for (const infixSpan of decl.eachDeclarationForInfix(popInfix))
								phraseSpansMap.add(
									phrase.forward(infixSpan.boundary.subject),
									infixSpan);
					}
				}
			}
			
			if (phraseSpansMap.size === 0)
				return;
			
			// It's important that these declarations are enumerated
			// in breadth-first order, so that deeper nodes have a 
			// container that they can reference during construction
			// time. Before node construction can happen, the new 
			// Spans need to be organized in a data structure that 
			// makes breadth-first traversal easy.
			// This data structure stores the items of the Phrase -> Spans
			// map, sorted by the length of the Phrase.
			const newAreaSorted = 
				Array.from(phraseSpansMap.entries())
					.sort((a, b) => a[0].length - b[0].length);
			
			// Stores all the nodes that have been affected by a new
			// fragment either being added or removed from it.
			const affectedNodes = new Map<Phrase, Node>();
			
			// Stores a subset of the affectedNodes array. Contains
			// only the nodes that are at the outer-most level of depth
			// within the node set (not necessarily the document root).
			const affectedNodesApexes: Node[] = [];
			
			/**
			 * @returns The containing node that
			 * corresponds to the specified phrase.
			 */ 
			const findNode = (phrase: Phrase) =>
			{
				if (phrase.length === 0)
					throw Exception.invalidArgument();
				
				return affectedNodes.get(phrase) || phrase.associatedNode;
			};
			
			// The following block populates the appropriate Nodes
			// in the graph with the new Span objects that were sent
			// in through the "root" parameter. New Node objects
			// are created if necessary.
			for (const [phrase, declarations] of newAreaSorted)
			{
				for (const declaration of declarations)
				{
					const nodeAtPhrase = findNode(phrase);
					if (nodeAtPhrase)
					{
						// We add the phrase to the table of affected nodes,
						// to handle the case when it was extracted from the
						// cache.
						affectedNodes.set(phrase, nodeAtPhrase);
						nodeAtPhrase.addDeclaration(declaration);
						continue;
					}
					
					const container = phrase.length > 1 ?
						findNode(phrase.back()) :
						null;
					
					if (phrase.length > 1 && container === null)
						throw Exception.unknownState();
					
					// Note that when creating a Node, it's
					// automatically bound to it's container.
					const newNode = new Node(container, declaration);
					affectedNodes.set(phrase, newNode);
					
					// Populate the affectedNodesApexes array, 
					// which is needed to find the nodes that are
					// affected by the change, but are not located
					// directly within the patch.
					if (affectedNodesApexes.length === 0)
					{
						affectedNodesApexes.push(newNode);
					}
					else
					{
						// If we've encountered a node that is higher
						// than the level of depth defined in the nodes
						// currently in the affectedNodesApexes array.
						const highestDepth = affectedNodesApexes[0].phrase.length;
						const nodeDepth = newNode.phrase.length;
						
						if (nodeDepth < highestDepth)
							affectedNodesApexes.length = 0;
						
						if (nodeDepth <= highestDepth)
							affectedNodesApexes.push(newNode);
					}
				}
			}
			
			// Add or update all new HyperEdges by feeding in all
			// annotation spans for each declaration span.
			// This needs to happen in a second pass because
			// all new nodes need to be created and positioned
			// in the graph before new "HyperEdge spans" can be added,
			// because doing this causes resolution to occur.
			for (const node of affectedNodes.values())
				for (const declaration of node.declarations)
				{
					if (declaration instanceof Span)
					{
						for (const annotation of declaration.statement.annotations)
							node.addEdgeFragment(annotation);
					}
					else
					{
						const nfx = declaration.containingInfix;
						
						for (const boundary of nfx.rhs)
						{
							node.addEdgeFragment(new InfixSpan(
								declaration.containingSpan,
								nfx,
								boundary));
						}
					}
				}
			
			// This is doing the reverse of what the above affectedNodes
			// loop is doing ... this is connecting other nodes to the affected
			// nodes, whereas the loop above is connecting affectedNodes
			// to others.
			if (affectedNodesApexes.length > 0)
			{
				// Stores the series of containers that any of the newly discovered
				// possibly affected nodes must have in their containment list
				// in order to be included in the "affectedNodes" array.
				const apexContainers = affectedNodesApexes
					.map(node => node.container)
					.filter((node): node is Node => node !== null)
					.filter((v, i, a) => a.indexOf(v) === i);
				
				const checkRoot = apexContainers.length === 0;
				const isBelowAnApexContainer = (node: Node) =>
					node.containment.some(n => apexContainers.includes(n));
				
				for (const scsrNode of affectedNodesApexes)
				{
					// Pattern and URI resolution doesn't occur in the
					// Node graph, so when the node's subject isn't 
					// a term, we don't add any edges to it.
					if (!(scsrNode.subject instanceof Term))
						continue;
					
					const terms = this.nodeIndex.getAssociatedTerms(scsrNode);
					
					for (const term of terms)
					{
						const predecessors = this.nodeIndex.getNodesByTerm(term);
						
						for (const predecessor of predecessors)
							if (checkRoot || isBelowAnApexContainer(predecessor))
								predecessor.addEdgeSuccessor(scsrNode);
					}
				}
			}
			
			// If there's no active transaction the corresponds to the input
			// document, the most likely reason is that an entire document
			// is being included for the first time.
			if (txn)
			{
				for (const maybeDeadEdge of txn.destablizedEdges)
					if (maybeDeadEdge.fragments.length > 0)
						maybeDeadEdge.predecessor.disposeEdge(maybeDeadEdge);
				
				for (const maybeDeadNode of txn.destabilizedNodes)
					if (maybeDeadNode.declarations.size === 0)
					{
						maybeDeadNode.dispose();
						this.nodeIndex.delete(maybeDeadNode);
					}
			}
			
			// Populate nodeCache with any newly created nodes.
			for (const affectedNode of affectedNodes.values())
			{
				affectedNode.sortOutbounds();
				const cachedNode = affectedNode.phrase.associatedNode;
				
				if (cachedNode)
				{
					if (cachedNode !== affectedNode)
						throw Exception.unknownState();
					
					this.nodeIndex.update(affectedNode);
				}
				
				this.sanitize(affectedNode);
			}
		}
		
		/**
		 * Performs setup for the invalidate and revalidate methods.
		 */
		private methodSetup(root: Document | Statement)
		{
			const document = root instanceof Document ?
				root :
				root.document;
			
			const iterator = root instanceof Document ?
				document.eachDescendant() :
				document.eachDescendant(root, true);
			
			return { document, iterator };
		}
		
		/**
		 * Reports any Node-level faults detected.
		 */
		private sanitize(node: Node)
		{
			// Check for faulty refresh types
			// This can only happen on non-infix spans
			if (!(node.declarations.values().next().value instanceof Span))
				return;
			
			const smts = node.statements;
			const smtsRefresh = smts.filter(smt => smt.isRefresh);
			const smtsAnnotated = smts.filter(smt => smt.allAnnotations.length > 0);
			
			if (smtsRefresh.length > 0 && smtsAnnotated.length > 0)
				for (const smt of smtsRefresh)
					this.program.faults.report(new Fault(
						Faults.TypeCannotBeRefreshed,
						smt));
		}
		
		/**
		 * Stores a map of all nodes that
		 * have been loaded into the program, indexed
		 * by a string representation of it's URI.
		 */
		private readonly nodeIndex: NodeIndex;
		
		/**
		 * Returns the GraphTransaction associated with the specified source object.
		 * A new GraphTransaction is created in the case when no match active 
		 * transaction is available, or when the active transaction is from a previous
		 * version of the document.
		 */
		private getTransaction(source: Document | Statement)
		{
			const doc = source.class === Class.document ?
				source :
				source.document;
			
			let txn = this.activeTransactions.get(doc);
			if (!txn || doc.version.newerThan(txn.version))
				this.activeTransactions.set(doc, txn = new GraphTransaction(doc.version));
			
			return txn;
		}
		
		/**
		 * Stores a GraphTransaction instance in the case
		 * when an edit transaction is underway.
		 */
		private activeTransactions = new Map<Document, GraphTransaction>();
		
		/**
		 * Serializes the Graph into a format suitable
		 * for debugging and comparing against baselines.
		 */
		toString()
		{
			return this.nodeIndex.toString();
		}
	}
	
	/**
	 * @internal
	 */
	class GraphTransaction
	{
		constructor(
			/**
			 * Stores the version of a document to which this GraphTransaction
			 * is applied. GraphTransactions are expected to operate on documents
			 * within the time frame of a single version. If a document's version
			 * changes, the GraphTransaction is no longer applicable.
			 */
			readonly version: VersionStamp) { }
		
		/**
		 * Stores an array of Nodes that no longer have any
		 * underlying Span objects, due to their removal in
		 * the invalidation phase.
		 */
		readonly destabilizedNodes: Node[] = [];
		
		/**
		 * Stores an array of Fans that no longer have any
		 * underlying Span objects, due to their removal in
		 * the invalidation phase.
		 */
		readonly destablizedEdges: HyperEdge[] = [];
	}
	
	/**
	 * @internal
	 * Debug utility.
	 */
	function serializeNodes(nodes: Node[])
	{
		return "\n" + nodes.map(node => node.toString(true)).join("\n");
	}
}
