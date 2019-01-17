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
			for (const smt of hook.parents)
				this.exclude(smt);
		});
		
		program.hooks.Revalidate.capture(hook =>
		{
			for (const smt of hook.parents)
				this.include(smt);
		});
	}
	
	/**
	 * Reads a root Node with the specified
	 * name out of the specified document.
	 */
	read(doc: X.Document, name: string): X.Node | null
	{
		const uriText = doc.sourceUri
			.extend([], name)
			.toString(true, true);
		
		return this.nodeCache.get(uriText) || null;
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
		
		// Attempts to remove a span from the specified target. 
		// Adds the target to a list in the case when the target's
		// last Span was removed.
		const tryDelete = (from: X.Node | X.HyperEdge, decl: X.Span | X.InfixSpan) =>
		{
			if (from instanceof X.Node)
			{
				from.declarations.delete(decl);
				
				if (from.declarations.size === 0)
					txn.destabilizedNodes.push(from);
			}
			else
			{
				const node = from.predecessor;
				node.removeEdgeSource(decl);
				
				if (from.sources.length === 0)
					txn.destablizedEdges.push(from);
			}
		}
		
		for (const { statement } of iterator)
		{
			for (const declaration of statement.declarations)
			{
				const associatedNodes = new Set(declaration
					.factor()
					.map(spine => X.Uri.create(spine))
					.map(uri => this.nodeCache.get(uri.toString(true, true)))
					.filter((n): n is X.Node => n instanceof X.Node));
				
				for (const associatedNode of associatedNodes)
				{
					// Remove the declaration-side spans from the
					// Node that corresponds to the declaration.
					tryDelete(associatedNode, declaration);
					
					// Attempt to remove the annotations from the
					// Node's outbound HyperEdges.
					for (const outEdge of associatedNode.outbounds)
						for (const annotation of statement.annotations)
							tryDelete(outEdge, annotation);
					
					// Attempt to remove the annotations from the
					// Node's outbound HyperEdges.
					for (const inEdge of associatedNode.inbounds)
						for (const annotation of statement.annotations)
							tryDelete(inEdge, annotation);
				}
			}
		}
		
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
		const affectedNodes: X.Node[] = [];
		
		/**
		 * @returns The containing node that
		 * corresponds to the specified URI.
		 */ 
		const findNode = (uri: X.Uri) =>
		{
			if (uri.typePath.length === 0)
				throw X.Exception.invalidArgument();
			
			const existingNode = affectedNodes.find(node => 
				node.uri.equals(uri, true));
			
			if (existingNode)
				return existingNode;
			
			const cachedNode = this.nodeCache.get(uri.toString(true, true));
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
			
			for (const declaration of statement.declarations)
			{
				for (const spine of declaration.factor())
				{
					const uri = X.Uri.create(spine);
					const typeNames = spine.vertebrae
						.map(vert => vert.toString());
					
					multiMap.add(
						typeNames.join(X.Syntax.terminal),
						{ uri, declaration });
					
					// If the declaration has population infixes, these
					// need to be added to the map as though they
					// were regular declarations.
					
					const popInfixes = declaration.infixes.filter(nfx => nfx.isPopulation);
					if (popInfixes.length === 0)
						continue;
					
					for (const infix of popInfixes)
					{
						for (const infixSpan of declaration.eachDeclarationForInfix(infix))
						{
							const nfxText = infixSpan.boundary.subject.toString();
							const infixSpineParts = typeNames.concat(nfxText);
							
							multiMap.add(
								infixSpineParts.join(X.Syntax.terminal),
								{ uri: uri.extend([], nfxText), declaration: infixSpan });
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
				nodeAtUri.declarations.add(declaration);
				continue;
			}
			
			const container = uri.typePath.length > 1 ?
				findNode(uri.retract(0, 1)) :
				null;
			
			if (uri.typePath.length > 1 && container === null)
			{
				console.log(this.toString());
				console.log(serializeNodes(affectedNodes));
				throw X.Exception.unknownState();
			}
			
			// Note that when creating a Node, it's
			// automatically bound to it's container.
			const newNode = new X.Node(container, declaration);
			affectedNodes.push(newNode);
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
						node.addEdgeSource(annotation);
				}
				else
				{
					const nfx = declaration.containingInfix;
					
					for (const boundary of nfx.rhs)
					{
						node.addEdgeSource(new X.InfixSpan(
							declaration.containingSpan,
							nfx,
							boundary));
					}
				}
			}
				
		// If there's no active transaction the corresponds to the input
		// document, the most likely reason is that an entire document
		// is being included for the first time.
		if (txn)
		{
			for (const maybeDeadEdge of txn.destablizedEdges)
				if (maybeDeadEdge.sources.length > 0)
					maybeDeadEdge.predecessor.disposeEdge(maybeDeadEdge);
			
			for (const maybeDeadNode of txn.destabilizedNodes)
				if (maybeDeadNode.declarations.size === 0)
					maybeDeadNode.dispose();
		}
		
		// Populate nodeCache with any newly created nodes.
		for (const affectedNode of affectedNodes)
		{
			affectedNode.sortOutbounds();
			
			const affectedUri = affectedNode.uri.toString(true, true);
			const cachedNode = this.nodeCache.get(affectedUri);
			
			if (cachedNode)
			{
				if (cachedNode !== affectedNode)
					throw X.Exception.unknownState();
			}
			else
			{
				this.nodeCache.set(affectedUri, affectedNode);
			}
		}
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
	 * Stores a 2-dimensional map of all nodes that
	 * have been loaded into the program, indexed
	 * by a string representation of it's URI.
	 */
	private readonly nodeCache = new Map<string, X.Node>();
	
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
		if (this.nodeCache.size === 0)
			return "(empty)";
		
		if (this.nodeCache.size === 1)
		{
			const [key, value] = this.nodeCache.entries().next().value;
			return key + " " + value;
		}
		
		const out: string[] = [];
		const keys = Array.from(this.nodeCache.keys()).map(s =>
		{
			const uri = X.Uri.parse(s);
			return uri ?
				uri.fileName + X.Syntax.typePathSeparator + uri.typePath.join("/") :
				s;
		});
		
		const values = Array.from(this.nodeCache.values());
		
		for (let i = -1; ++i < keys.length;)
		{
			const key = keys[i];
			const value = values[i].toString(false);
			out.push(`${key}\n\t${value}\n`);
		}
		
		return out.join("\n").trim();
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