import * as X from "../../X";


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
	constructor(private readonly program: X.Program)
	{
		if (HyperGraph.disabled)
			return;
		
		program.documents.each()
			.forEach(this.include.bind(this));
		
		program.hooks.DocumentCreated.capture(hook =>
		{
			this.include(hook.document);
		});
		
		program.hooks.DocumentDeleted.capture(hook =>
		{
			this.exclude(hook.document);
		});
		
		program.hooks.Invalidate.capture(hook =>
		{
			if (hook.parents.length > 0)
			{
				for (const smt of hook.parents)
					this.exclude(smt);
			}
			else this.exclude(hook.document);
		});
		
		program.hooks.Revalidate.capture(hook =>
		{
			if (hook.parents.length > 0)
			{
				for (const smt of hook.parents)
					this.include(smt);
			}
			else this.include(hook.document);
		});
	}
	
	/**
	 * Reads a root Node with the specified
	 * name out of the specified document.
	 */
	read(document: X.Document, name: string): X.Node | null
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
	*readRoots(document: X.Document)
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
	private exclude(root: X.Document | X.Statement)
	{
		const { document, iterator } = this.methodSetup(root);
		const txn = new GraphTransaction();
		const maybeDestabilizedEdges: X.HyperEdge[] = [];
		
		for (const { statement } of iterator)
		{
			for (const declaration of statement.declarations)
			{
				const associatedNodes = new Set(declaration
					.factor()
					.map(spine => X.Uri.create(spine))
					.map(uri => this.nodeIndex.getNodeByUri(uri))
					.filter((n): n is X.Node => n instanceof X.Node));
				
				for (const associatedNode of associatedNodes)
				{
					associatedNode.removeDeclaration(declaration);
					
					if (associatedNode.declarations.size === 0)
						txn.destabilizedNodes.push(associatedNode);
					
					for (const ob of associatedNode.outbounds)
						if (ob.fragments.length === 0)
							txn.destablizedEdges.push(ob);
					
					//for (const ib of associatedNode.inbounds)
					//	maybeDestabilizedEdges.push(ib);
				}
			}
		}
		
		//for (const edge of maybeDestabilizedEdges)
		//	if (edge.successors.every(scsr => txn.destabilizedNodes.includes(scsr.node)))
		//		txn.destablizedEdges.push(edge);
		
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
	private include(root: X.Document | X.Statement)
	{
		const { document, iterator } = this.methodSetup(root);
		const txn = this.activeTransactions.get(document);
		
		// Stores all the nodes that have been affected by a new
		// fragment either being added or removed from it.
		const affectedNodes: X.Node[] = [];
		
		// Stores a subset of the affectedNodes array. Contains
		// only the nodes that are at the highest level of depth
		// within the node set.
		const topMostAffectedNodes: X.Node[] = [];
		
		/**
		 * @returns The containing node that
		 * corresponds to the specified URI.
		 */ 
		const findNode = (uri: X.Uri) =>
		{
			if (uri.types.length === 0)
				throw X.Exception.invalidArgument();
			
			const existingNode = affectedNodes.find(node => 
				node.uri.equals(uri, true));
			
			if (existingNode)
				return existingNode;
			
			const cachedNode = this.nodeIndex.getNodeByUri(uri);
			if (cachedNode)
				return cachedNode;
			
			return null;
		}
		
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
		interface breadthFirstEntry { uri: X.Uri, declaration: X.Span | X.InfixSpan };
		const breadthFirstOrganizer: Array<X.MultiMap<string, breadthFirstEntry>> = [];
		
		for (const { level, statement } of iterator)
		{
			// Possibly append a bunch of empty multi-maps
			// at the end of the organizer, so that we don't
			// access an uninitialized index down below.
			while (breadthFirstOrganizer.length < level + 1)
				breadthFirstOrganizer.push(new X.MultiMap<string, breadthFirstEntry>());
			
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
					const uri = X.Uri.create(spine);
					const typeNames = spine.vertebrae
						.map(vert => vert.toString());
					
					multiMap.add(
						typeNames.join(X.Syntax.terminal),
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
							const nfxText = infixSpan.boundary.subject.toString();
							const infixSpineParts = typeNames.concat(nfxText);
							
							multiMap.add(
								infixSpineParts.join(X.Syntax.terminal),
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
			{
				if ("DEBUG")
				{
					console.log(this.toString());
					console.log(serializeNodes(affectedNodes));
				}
				throw X.Exception.unknownState();
			}
			
			// Note that when creating a Node, it's
			// automatically bound to it's container.
			const newNode = new X.Node(container, declaration);
			affectedNodes.push(newNode);
			
			// Populate the topMostAffectedNodes array, 
			// which is needed to find the nodes that are
			// affected by the change, but are not located
			// directly within the patch.
			if (topMostAffectedNodes.length === 0)
			{
				topMostAffectedNodes.push(newNode);
			}
			else
			{
				const highestDepth = affectedNodes[0].uri.types.length;
				const nodeDepth = newNode.uri.types.length;
				
				if (nodeDepth < highestDepth)
					topMostAffectedNodes.length = 0;
				
				if (nodeDepth <= highestDepth)
					topMostAffectedNodes.push(newNode);
			}
		}
		
		// Add or update all new Fans by feeding in all
		// annotation spans for each declaration span.
		// This needs to happen in a second pass because
		// all new nodes need to be created and positioned
		// in the graph before new "fan spans" can be added,
		// because doing this causes resolution to occur.
		for (const node of affectedNodes)
			for (const declaration of node.declarations)
			{
				if (declaration instanceof X.Span)
				{
					for (const annotation of declaration.statement.annotations)
						node.addEdgeFragment(annotation);
				}
				else
				{
					const nfx = declaration.containingInfix;
					
					for (const boundary of nfx.rhs)
					{
						node.addEdgeFragment(new X.InfixSpan(
							declaration.containingSpan,
							nfx,
							boundary));
					}
				}
			}
		
		if (topMostAffectedNodes.length > 0)
		{
			// Stores the series of containers that any of the newly discovered
			// possibly affected nodes must have in their containment list
			// in order to be included in the "affectedNodes" array.
			const containers = topMostAffectedNodes
				.map(node => node.container)
				.filter((node): node is X.Node => node !== null)
				.filter((v, i, a) => a.indexOf(v) === i);
			
			const hasContainer = (node: X.Node) =>
				node.containment.some(n => containers.includes(n));
				
			const depth = topMostAffectedNodes[0].uri.types.length;
			const checkRoot = containers.length === 0;
			
			for (const scsrNode of topMostAffectedNodes)
			{
				const idents = this.nodeIndex.getAssociatedIdentifiers(scsrNode);
				
				for (const ident of idents)
				{
					const predNodes = this.nodeIndex.getNodesByIdentifier(ident);
					
					for (const predNode of predNodes)
						if (checkRoot || hasContainer(predNode))
							predNode.addEdgeSuccessor(scsrNode);
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
					throw X.Exception.unknownState();
				
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
	private methodSetup(root: X.Document | X.Statement)
	{
		const document = root instanceof X.Document ?
			root :
			root.document;
		
		const iterator = root instanceof X.Document ?
			document.eachDescendant() :
			document.eachDescendant(root, true);
		
		return { document, iterator };
	}
	/**
	 * Reports any Node-level faults detected.
	 */
	private sanitize(node: X.Node)
	{
		// Check for faulty refresh types
		// This can only happen on non-infix spans
		if (!(node.declarations.values().next().value instanceof X.Span))
			return;
		
		const smts = node.statements;
		const smtsRefresh = smts.filter(smt => smt.isRefresh);
		const smtsAnnotated = smts.filter(smt => smt.allAnnotations.length > 0);
		
		if (smtsRefresh.length > 0 && smtsAnnotated.length > 0)
			for (const smt of smtsRefresh)
				this.program.faults.report(new X.Fault(
					X.Faults.TypeCannotBeRefreshed,
					smt));
	}
	
	/**
	 * Stores a map of all nodes that
	 * have been loaded into the program, indexed
	 * by a string representation of it's URI.
	 */
	private readonly nodeIndex = new X.NodeIndex(this.program);
	
	/**
	 * Stores a GraphTransaction instance in the case
	 * when an edit transaction is underway.
	 */
	private activeTransactions = new Map<X.Document, GraphTransaction>();
	
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
	readonly destabilizedNodes: X.Node[] = [];
	
	/**
	 * Stores an array of Fans that no longer have any
	 * underlying Span objects, due to their removal in
	 * the invalidation phase.
	 */
	readonly destablizedEdges: X.HyperEdge[] = [];
}


/**
 * @internal
 * Debug utility.
 */
function serializeNodes(nodes: X.Node[])
{
	return "\n" + nodes.map(node => node.toString(true)).join("\n");
}
