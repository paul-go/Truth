
namespace Truth
{
	/**
	 * 
	 */
	export class NodeIndex
	{
		/** */
		constructor(program: Program)
		{
			/*DEAD
			program.on(CauseDocumentUriChange, data =>
			{
				// Update the entire cache when the URI of any document changes.
				const newUriStore = data.newUri.retractTypeTo(0);
				const entries = Array.from(this.phraseToNodeMap.entries());
				
				for (const [oldUriText, node] of entries)
				{
					if (node.document !== data.document)
						continue;
					
					const oldUri = Not.null(Uri.tryParse(oldUriText));
					const newUriText = newUriStore
						.extendType(oldUri.types.map(t => t.value))
						.toString();
					
					this.phraseToNodeMap.delete(oldUriText);
					this.phraseToNodeMap.set(newUriText, node);
				}
			});
			*/
		}
		
		/**
		 * Enumerates through all Node instances stored
		 * in the index.
		 */
		*eachNode()
		{
			for (const node of this.phraseToNodeMap.values())
				yield node;
		}
		
		/**
		 * Gets the number of nodes stored in the index.
		 */
		get count()
		{
			return this.phraseToNodeMap.size;
		}
		
		/**
		 * Updates the index, establishing a cached relationship
		 * between the specified uri and the specified node.
		 */
		set(phrase: Phrase, node: Node)
		{
			this.phraseToNodeMap.set(phrase, node);
			this.update(node);
		}
		
		/** 
		 * Updates the index by refreshing in the set of terms
		 * that are associated with the specified node.
		 */
		update(node: Node)
		{
			const pastTerms = this.nodesToTermsMap.get(node);
			const presentTerms = this.getAssociatedTerms(node);
			
			if (pastTerms !== undefined)
			{
				for (const [idx, term] of pastTerms.entries())
				{
					if (presentTerms.includes(term))
						continue;
					
					pastTerms.splice(idx, 1);
					
					const map = this.termToNodesMap.get(term);
					if (map === undefined)
						continue;
					
					map.delete(node);
					
					if (map.size === 0)
						this.termToNodesMap.delete(term);
				}
			}
			
			for (const term of presentTerms)
			{
				const nodesForTerm = this.termToNodesMap.get(term) || (() =>
				{
					const out = new Set<Node>();
					this.termToNodesMap.set(term, out);
					return out;
				})();
				
				nodesForTerm.add(node);
			}
			
			this.nodesToTermsMap.set(node, presentTerms);
		}
		
		/** */
		getNodeByPhrase(phrase: Phrase)
		{
			return this.phraseToNodeMap.get(phrase) || null;
		}
		
		/**
		 * @returns An array that contains the nodes that are associated
		 * with the specified term that exist at or below the specified
		 * depth. "Associated" means that the term is either equivalent
		 * to the Node's main subject, or it is referenced in one of it's edges.
		 */
		getNodesByTerm(term: Term)
		{
			const out = this.termToNodesMap.get(term);
			return out ? Array.from(out) : [];
		}
		
		/**
		 * Removes the specified node from the index, if it exists.
		 */
		delete(deadNode: Node)
		{
			for (const [uri, node] of this.phraseToNodeMap)
				if (node === deadNode)
					this.phraseToNodeMap.delete(uri);
			
			const existingTerms = this.nodesToTermsMap.get(deadNode);
			if (existingTerms === undefined)
				return;
			
			for (const term of existingTerms)
			{
				const nodes = this.termToNodesMap.get(term);
				if (nodes === undefined)
					continue;
				
				nodes.delete(deadNode);
				
				if (nodes.size === 0)
					this.termToNodesMap.delete(term);
			}
			
			this.nodesToTermsMap.delete(deadNode);
		}
		
		/** 
		 * @returns An array that contains the terms associated with
		 * the specified Node.
		 */
		getAssociatedTerms(node: Node)
		{
			const terms: Term[] = [];
			
			if (node.subject instanceof Term)
				terms.push(node.subject);
			
			for (const smt of node.statements)
				for (const anno of smt.allAnnotations)
					if (anno.boundary.subject instanceof Term)
						terms.push(anno.boundary.subject);
			
			return terms;
		}
		
		/**
		 * Stores a map of all nodes that have been loaded into the program,
		 * indexed by the Phrase that references them.
		 */
		private readonly phraseToNodeMap = new Map<Phrase, Node>();
		
		/**
		 * Stores a map which is indexed by a unique term, and which as
		 * values that are the nodes that use that term, either as a declaration
		 * or an annotation.
		 * 
		 * The purpose of this cache is to get a quick answer to the question:
		 * "We added a new term at position X ... what nodes might possibly
		 * have been affected by this?"
		 */
		private readonly termToNodesMap = new Map<Term, Set<Node>>();
		
		/**
		 * Stores a map which is essentially a reverse of termToNodesMap.
		 * This is so that when nodes need to be deleted or updated, we can
		 * quickly find the place in termToNodesMap where the node has
		 * been referenced.
		 */
		private readonly nodesToTermsMap = new WeakMap<Node, Term[]>();
		
		/**
		 * Serializes the index into a format suitable
		 * for debugging and comparing against baselines.
		 */
		toString()
		{
			if (this.phraseToNodeMap.size === 0)
				return "(empty)";
			
			const out: string[] = [];
			const keys = Array.from(this.phraseToNodeMap.keys())
				.map(ph => ph.toString());
			
			const values = Array.from(this.phraseToNodeMap.values());
			
			for (let i = -1; ++i < keys.length;)
			{
				const key = keys[i];
				const value = values[i].toString(false);
				out.push(`${key}\n\t${value}\n`);
			}
			
			out.push("(Term Cache)");
			
			for (const [term, nodes] of this.termToNodesMap)
			{
				out.push("\t" + term);
				out.push("\t\t: " + Array.from(nodes)
					.map(node => node.phrase.toString())
					.join(", "));
			}
			
			return out.join("\n").trim();
		}
	}
}
