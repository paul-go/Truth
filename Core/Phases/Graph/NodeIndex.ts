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
		for (const node of this.nodeCache.values())
			yield node;
	}
	
	/**
	 * Gets the number of nodes stored in the index.
	 */
	get count()
	{
		return this.nodeCache.size;
	}
	
	/**
	 * Updates the index, establishing a cached relationship
	 * between the specified uri and the specified node.
	 */
	set(uri: X.Uri | string, node: X.Node)
	{
		const uriText = typeof uri === "string" ? uri : uri.toString();
		this.nodeCache.set(uriText, node);
		this.update(node);
	}
	
	/** 
	 * Updates the index by refreshing in the set of identifiers
	 * that are associated with the specified node.
	 */
	update(node: X.Node)
	{
		const getBlock = (key: string) =>
		{
			return this.identifierBlocks.get(key) || (() =>
			{
				const block: X.Node[][] = [];
				this.identifierBlocks.set(key, block);
				return block;
			})();
		}
		
		this.deleteIdentifiers(node);
		
		// The depth needs to be 1 less the number of types
		// because in the index, depth is 0 based, where as
		// in the document, it isn't.
		const depth = node.uri.types.length - 1;
		const identifiers = this.getAssociatedIdentifiers(node);
		
		for (const identifier of identifiers)
		{
			const block = getBlock(identifier);
			
			// Expand out the first dimension of the block
			// (which is a jagged array) so that we don't
			// cause a sparse array.
			for (let i = block.length - 1; i < depth; i++)
				block.push([]);
			
			const nodes = block[depth];
			
			if (!nodes.includes(node))
				nodes.push(node);
		}
	}
	
	/** */
	getByUri(uri: X.Uri | string)
	{
		const uriText = typeof uri === "string" ? uri : uri.toString();
		return this.nodeCache.get(uriText);
	}
	
	/**
	 * @returns An array that contains the nodes that are associated
	 * with the specified identifier that exist at or below the specified
	 * depth. "Associated" means that the identifier is either equivalent
	 * to the Node's main subject, or it is referenced in one of it's edges.
	 */
	getByAssociatedIdentifier(identifer: string, minDepth = 1)
	{
		const block = this.identifierBlocks.get(identifer);
		if (block === undefined || block.length < minDepth)
			return [];
		
		return Object.freeze(block.slice(minDepth).reduce((a, b) => a.concat(b), []));
	}
	
	/**
	 * Removes the specified node from the index, if it exists.
	 */
	delete(deadNode: X.Node)
	{
		this.deleteCached(deadNode);
		this.deleteIdentifiers(deadNode);
	}
	
	/** */
	private deleteCached(deadNode: X.Node)
	{
		for (const [uri, node] of this.nodeCache)
			if (node === deadNode)
				this.nodeCache.delete(uri);
	}
	
	/** */
	private deleteIdentifiers(deadNode: X.Node)
	{
		for (const identifier of this.getAssociatedIdentifiers(deadNode))
		{
			const block = this.identifierBlocks.get(identifier);
			if (block === undefined)
				continue;
			
			for (let depthArrayIdx = block.length; depthArrayIdx-- > 0;)
			{
				const depthArray = block[depthArrayIdx];
				
				for (let nodeIdx = depthArray.length; nodeIdx-- > 0;)
					if (depthArray[nodeIdx] === deadNode)
						depthArray.splice(nodeIdx, 1);
			}
			
			// Prune empty node arrays from the end
			while (block.length && block[block.length - 1].length === 0)
				block.pop();
			
			// Prune the entire block if everything was removed
			if (block.length === 0)
				this.identifierBlocks.delete(identifier);
		}
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
	private readonly nodeCache = new Map<string, X.Node>();
	
	/**
	 * Stores a map that is indexed by a string representation of an identifier,
	 * and has values that are a 2-dimensional node array.
	 * 
	 * The first dimension of this array represents a particular level of depth
	 * where nodes that are associated with the identifier exist. 
	 * 
	 * The second dimension stores the actual Nodes that are associated with
	 * the identifier.
	 * 
	 * The purpose of this cache is to get a quick answer to the question:
	 * "We added a new identifier at position X ... what could possibly
	 */
	private readonly identifierBlocks = new Map<string, X.Node[][]>();
	
	/**
	 * Serializes the index into a format suitable
	 * for debugging and comparing against baselines.
	 */
	toString()
	{
		if (this.nodeCache.size === 0)
			return "(empty)";
		
		const out: string[] = [];
		const keys = Array.from(this.nodeCache.keys()).map(s =>
		{
			const uri = X.Uri.tryParse(s);
			return uri ? uri.toString() : s;
		});
		
		const values = Array.from(this.nodeCache.values());
		
		for (let i = -1; ++i < keys.length;)
		{
			const key = keys[i];
			const value = values[i].toString(false);
			out.push(`${key}\n\t${value}\n`);
		}
		
		out.push("(Identifier Blocks)");
		
		for (const [identifier, block] of this.identifierBlocks)
		{
			out.push("\t" + identifier);
			
			for (let i = -1; ++i < block.length;)
			{
				const nodes = block[i];
				out.push(`\t\t${i}: ${nodes.map(n => n.name).join(", ")}`);
			}
		}
		
		return out.join("\n").trim();
	}
}
