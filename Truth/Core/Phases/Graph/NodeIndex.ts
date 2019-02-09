import * as X from "../../X";


/**
 * 
 */
export class NodeIndex
{
	/**
	 * Enumerates through all Node instances stored
	 * in the index.
	 */
	*eachNode()
	{
		for (const node of this.uriToNodeMap.values())
			yield node;
	}
	
	/**
	 * Gets the number of nodes stored in the index.
	 */
	get count()
	{
		return this.uriToNodeMap.size;
	}
	
	/**
	 * Updates the index, establishing a cached relationship
	 * between the specified uri and the specified node.
	 */
	set(uri: X.Uri | string, node: X.Node)
	{
		const uriText = typeof uri === "string" ? uri : uri.toString();
		this.uriToNodeMap.set(uriText, node);
		this.update(node);
	}
	
	/** 
	 * Updates the index by refreshing in the set of identifiers
	 * that are associated with the specified node.
	 */
	update(node: X.Node)
	{
		const pastIdentifiers = this.nodesToIdentifiersMap.get(node);
		const presentIdentifiers = this.getAssociatedIdentifiers(node);
		
		if (pastIdentifiers !== undefined)
		{
			for (const [idx, ident] of pastIdentifiers.entries())
			{
				if (presentIdentifiers.includes(ident))
					continue;
				
				pastIdentifiers.splice(idx, 1);
				
				const map = this.identifierToNodesMap.get(ident);
				if (map === undefined)
					continue;
				
				map.delete(node);
				
				if (map.size === 0)
					this.identifierToNodesMap.delete(ident);
			}
		}
		
		for (const identifier of presentIdentifiers)
		{
			const nodesForIdent = this.identifierToNodesMap.get(identifier) || (() =>
			{
				const out = new Set<X.Node>();
				this.identifierToNodesMap.set(identifier, out);
				return out;
			})();
			
			nodesForIdent.add(node);
		}
		
		this.nodesToIdentifiersMap.set(node, presentIdentifiers);
	}
	
	/** */
	getNodeByUri(uri: X.Uri | string)
	{
		const uriText = typeof uri === "string" ? uri : uri.toString();
		return this.uriToNodeMap.get(uriText);
	}
	
	/**
	 * @returns An array that contains the nodes that are associated
	 * with the specified identifier that exist at or below the specified
	 * depth. "Associated" means that the identifier is either equivalent
	 * to the Node's main subject, or it is referenced in one of it's edges.
	 */
	getNodesByIdentifier(identifer: string)
	{
		const out = this.identifierToNodesMap.get(identifer);
		return out ? Array.from(out) : [];
	}
	
	/**
	 * Removes the specified node from the index, if it exists.
	 */
	delete(deadNode: X.Node)
	{
		for (const [uri, node] of this.uriToNodeMap)
			if (node === deadNode)
				this.uriToNodeMap.delete(uri);
		
		const existingIdentifiers = this.nodesToIdentifiersMap.get(deadNode);
		if (existingIdentifiers === undefined)
			return;
		
		for (const identifier of existingIdentifiers)
		{
			const nodes = this.identifierToNodesMap.get(identifier);
			if (nodes === undefined)
				continue;
			
			nodes.delete(deadNode);
			
			if (nodes.size === 0)
				this.identifierToNodesMap.delete(identifier);
		}
		
		this.nodesToIdentifiersMap.delete(deadNode);
	}
	
	/** 
	 * @returns An array that contains the identifiers associated with
	 * the specified Node.
	 */
	getAssociatedIdentifiers(node: X.Node)
	{
		const identifiers: string[] = [];
		
		if (node.subject instanceof X.Identifier)
			identifiers.push(node.subject.typeName);
		
		for (const smt of node.statements)
			for (const anno of smt.allAnnotations)
				if (anno.boundary.subject instanceof X.Identifier)
					identifiers.push(anno.boundary.subject.typeName);
		
		return identifiers;
	}
	
	/**
	 * Stores a map of all nodes that have been loaded into the program,
	 * indexed by a string representation of it's URI.
	 */
	private readonly uriToNodeMap = new Map<string, X.Node>();
	
	/**
	 * Stores a map which is indexed by a unique identifier, and which as
	 * values that are the nodes that use that identifier, either as a declaration
	 * or an annotation.
	 * 
	 * The purpose of this cache is to get a quick answer to the question:
	 * "We added a new identifier at position X ... what nodes might possibly
	 * have been affected by this?"
	 */
	private readonly identifierToNodesMap = new Map<string, Set<X.Node>>();
	
	/**
	 * Stores a map which is essentially a reverse of identifierToNodesMap.
	 * This is so that when nodes need to be deleted or updated, we can
	 * quickly find the place in identifierToNodesMap where the node has
	 * been referenced.
	 */
	private readonly nodesToIdentifiersMap = new WeakMap<X.Node, string[]>();
	
	/**
	 * Serializes the index into a format suitable
	 * for debugging and comparing against baselines.
	 */
	toString()
	{
		if (this.uriToNodeMap.size === 0)
			return "(empty)";
		
		const out: string[] = [];
		const keys = Array.from(this.uriToNodeMap.keys()).map(s =>
		{
			const uri = X.Uri.tryParse(s);
			return uri ? uri.toString() : s;
		});
		
		const values = Array.from(this.uriToNodeMap.values());
		
		for (let i = -1; ++i < keys.length;)
		{
			const key = keys[i];
			const value = values[i].toString(false);
			out.push(`${key}\n\t${value}\n`);
		}
		
		out.push("(Identifier Cache)");
		
		for (const [identifier, nodes] of this.identifierToNodesMap)
		{
			out.push("\t" + identifier);
			out.push("\t\t: " + Array.from(nodes)
				.map(node => node.uri.toTypeString())
				.join(", "));
		}
		
		return out.join("\n").trim();
	}
}

