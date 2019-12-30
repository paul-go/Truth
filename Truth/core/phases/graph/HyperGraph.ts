
namespace Truth
{
	/**
	 * 
	 */
	export class HyperGraph
	{
		/**
		 * @internal
		 * Test-only field used to disable the functions of the Graph.
		 */
		static disabled: boolean | undefined;
		
		/** @internal */
		constructor(private readonly program: Program)
		{
			this.nodeIndex = new NodeIndex(this.program);
			
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
		}
		
		/**
		 * Reads a root Node with the specified
		 * name out of the specified document.
		 */
		read(document: Document, name: string): Node | null
		{
			const uriText = document.sourceUri
				.extendType(name)
				.toString();
			
			return this.nodeIndex.getNodeByUri(uriText) || null;
		}
		
		/**
		 * @returns An array containing the node objects
		 * that are defined at the root level of the specified
		 * document.
		 */
		*readRoots(document: Document)
		{
			for (const node of this.nodeIndex.eachNode())
				if (node.container === null)
					if (node.document === document)
						yield node;
		}
		
		/**
		 * Handles a document-level exclusion, which is the removal 
		 * of a section of Spans within a document, or possibly the
		 * entire document itself.
		 */
		private exclude(root: Document | Statement)
		{
			const { document, iterator } = this.methodSetup(root);
			const txn = new GraphTransaction();
			///const maybeDestabilizedEdges: HyperEdge[] = [];
			
			for (const { statement } of iterator)
			{
				for (const declaration of statement.declarations)
				{
					const associatedNodes = new Set(declaration
						.factor()
						.map(spine => Uri.clone(spine))
						.map(uri => this.nodeIndex.getNodeByUri(uri))
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
			const txn = this.activeTransactions.get(document);
			
			// Stores all the nodes that have been affected by a new
			// fragment either being added or removed from it.
			const affectedNodes: Node[] = [];
			
			// Stores a subset of the affectedNodes array. Contains
			// only the nodes that are at the outer-most level of depth
			// within the node set (not necessarily the document root).
			const affectedNodesApexes: Node[] = [];
			
			/**
			 * @returns The containing node that
			 * corresponds to the specified URI.
			 */ 
			const findNode = (uri: Uri) =>
			{
				if (uri.types.length === 0)
					throw Exception.invalidArgument();
				
				const existingNode = affectedNodes.find(node => 
					node.uri.equals(uri, true));
				
				if (existingNode)
					return existingNode;
				
				const cachedNode = this.nodeIndex.getNodeByUri(uri);
				if (cachedNode)
					return cachedNode;
				
				return null;
			};
			
			// It's important that these declarations are enumerated
			// in breadth-first order, so that deeper nodes have a 
			// container that they can reference during construction
			// time. Before node construction can happen, the new 
			// Spans need to be organized in a data structure that 
			// makes breadth-first traversal easy.
			// 
			// The breadthFirstOrganizer has 3 levels of organization:
			//
			// (1) An array of multi-maps which correspond to a single
			// level of depth in the hierarchy being traversed (which
			// could possibly extend across multiple localities in the
			// document).
			//
			// (2) A multi-map, that is keyed by a serialized representation
			// of one single spine found in the hierarchy, and whose
			// values are...
			//
			// (3) A unique Span object that corresponds to a unqiue
			// occurence of a subject in the document.
			interface IBreadthFirstEntry { uri: Uri; declaration: Span | InfixSpan }
			const breadthFirstOrganizer: Array<MultiMap<string, IBreadthFirstEntry>> = [];
			
			for (const { level, statement } of iterator)
			{
				// Possibly append a bunch of empty multi-maps
				// at the end of the organizer, so that we don't
				// access an uninitialized index down below.
				while (breadthFirstOrganizer.length < level + 1)
					breadthFirstOrganizer.push(new MultiMap<string, IBreadthFirstEntry>());
				
				// In the case when the current statement has been deemed
				// as cruft, it's OK to just continue, because the breadth-first
				// organizer will end up with an empty multi-map in the case
				// when the portion of the hierarchy being traversed looks 
				// like:
				// 
				// Foo
				// 	[Cruft]    <=== Will correspond to an empty multi-map
				// 		Bar
				//
				// Or, it will end up with a populated multi-map in the case
				// when there is another statement at [Cruft]'s level of depth.
				// Either way, there are no spans that need to be added from
				// statements marked as cruft. The traversal will still reach
				// the crufty statement's contents, causing the spines to still
				// be computed.
				if (statement.isCruft)
					continue;
				
				const multiMap = breadthFirstOrganizer[level];
				
				for (const decl of statement.declarations)
				{
					for (const spine of decl.factor())
					{
						const uri = Uri.clone(spine);
						const typeNames = spine.vertebrae.map(v => v.toString(true));
						
						multiMap.add(
							typeNames.join(Syntax.terminal),
							{ uri, declaration: decl });
						
						// If the declaration has population infixes, these
						// need to be added to the map as though they
						// were regular declarations.
						
						const popInfixes = decl.infixes.filter(nfx => nfx.isPopulation);
						if (popInfixes.length === 0)
							continue;
						
						for (const infix of popInfixes)
						{
							for (const infixSpan of decl.eachDeclarationForInfix(infix))
							{
								const nfxText = SubjectSerializer.forInternal(infixSpan);
								const infixSpineParts = typeNames.concat(nfxText);
								
								multiMap.add(
									infixSpineParts.join(Syntax.terminal),
									{
										uri: uri.extendType(nfxText),
										declaration: infixSpan
									});
							}
						}
					}
				}
			}
			
			// The following block populates the appropriate Nodes
			// in the graph with the new Span objects that were sent
			// in through the "root" parameter. New Node objects
			// are created if necessary.
			for (const multiMap of breadthFirstOrganizer)
				for (const entry of multiMap.values())
					for (const { uri, declaration } of entry)
					{
						const nodeAtUri = findNode(uri);
						if (nodeAtUri)
						{
							affectedNodes.push(nodeAtUri);
							nodeAtUri.addDeclaration(declaration);
							continue;
						}
						
						const container = uri.types.length > 1 ?
							findNode(uri.retractType(1)) :
							null;
						
						if (uri.types.length > 1 && container === null)
							throw Exception.unknownState();
						
						// Note that when creating a Node, it's
						// automatically bound to it's container.
						const newNode = new Node(container, declaration);
						affectedNodes.push(newNode);
						
						// Populate the topMostAffectedNodes array, 
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
							// than the level of depth defined in the nodes currently
							// in the affectedNodesApexes array.
							const highestDepth = affectedNodes[0].uri.types.length;
							const nodeDepth = newNode.uri.types.length;
							
							if (nodeDepth < highestDepth)
								affectedNodesApexes.length = 0;
							
							if (nodeDepth <= highestDepth)
								affectedNodesApexes.push(newNode);
						}
					}
			
			// Add or update all new HyperEdges by feeding in all
			// annotation spans for each declaration span.
			// This needs to happen in a second pass because
			// all new nodes need to be created and positioned
			// in the graph before new "HyperEdge spans" can be added,
			// because doing this causes resolution to occur.
			for (const node of affectedNodes)
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
					// an identifier, we don't add any edges to it.
					if (!(scsrNode.subject instanceof Identifier))
						continue;
					
					const idents = this.nodeIndex.getAssociatedIdentifiers(scsrNode);
					
					for (const ident of idents)
					{
						const predecessors = this.nodeIndex.getNodesByIdentifier(ident);
						
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
			for (const affectedNode of affectedNodes)
			{
				affectedNode.sortOutbounds();
				
				const affectedUri = affectedNode.uri.toString();
				const cachedNode = this.nodeIndex.getNodeByUri(affectedUri);
				
				if (cachedNode)
				{
					if (cachedNode !== affectedNode)
						throw Exception.unknownState();
					
					this.nodeIndex.update(affectedNode);
				}
				else
				{
					this.nodeIndex.set(affectedUri, affectedNode);
				}
				
				this.sanitize(affectedNode);
			}
		}
		
		/** */
		private log()
		{
			console.log("---- INTERNAL GRAPH REPRESENTATION ----");
			for (const node of this.nodeIndex.eachNode())
				console.log(node.toString(true));
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
	 * 
	 */
	class GraphTransaction
	{
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
