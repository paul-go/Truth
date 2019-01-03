import * as X from "../../X";


/**
 * A class that represents a single Node contained within
 * the Program's Graph. Nodes are long-lived objects that
 * persist between edit frames, and maintain referential
 * integrity.
 * 
 * Nodes are connected in a graph not by edges, but by
 * "Fans". A Fan is similar to a directed edge in that it has
 * a single origin, but differs in that it has multiple destinations.
 * It is necessary for Nodes to be connected to each other
 * in this way, in order for further phases in the pipeline
 * to perform type resolution.
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
			for (const fan of node._outbounds)
				this.disposeFan(fan);
			
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
	 * Removes the specified Fan from this Node's
	 * set of outbounds.
	 * 
	 * @throws In the case when the specified Fan is
	 * not owned by this Node.
	 */
	disposeFan(fan: X.Fan)
	{
		if (fan.origin !== this)
			throw X.Exception.invalidArgument();
		
		for (const target of fan.targets)
			target._inbounds.delete(fan);
		
		fan.sources.clear();
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
	 * Gets an immutable set of Fans from adjacent or
	 * contained Nodes that reference this Node. 
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
	private readonly _inbounds = new Set<X.Fan>();
	
	/**
	 * Gets an array of Fans that connect this Node to
	 * others, being either adjacents, or Nodes that
	 * exists somewhere in the containment hierarchy.
	 */
	get outbounds()
	{
		return X.HigherOrder.copy(this._outbounds);
	}
	private readonly _outbounds: X.Fan[] = [];
	
	/**
	 * @internal
	 * Sorts the outbound Fans, so that they're ordering
	 * is consistent with the way their corresponding
	 * annotations appear in the underlying document.
	 */
	sortOutbounds()
	{
		if (this._outbounds.length === 0)
			return;
		
		if (this._outbounds.length === 1)
		{
			const fan = this._outbounds[0];
			if (fan.sources.size === 1)
				return;
		}
		
		const fanLookup = new Map<X.Fan, [X.Statement, number]>();
		
		for (const fan of this._outbounds)
		{
			for (const src of fan.sources.values())
			{
				const st = src.statement;
				const idx = st.document.getStatementIndex(st);
				const existingTuple = fanLookup.get(fan);
				
				if (existingTuple !== undefined)
				{
					const existingStmt = existingTuple[0];
					const existingStmtIdx = existingTuple[1];
					
					if (idx < existingStmtIdx)
					{
						existingTuple[0] = existingStmt;
						existingTuple[1] = existingStmtIdx;
					}
				}
				else
				{
					fanLookup.set(fan, [st, idx]);
				}
			}
		}
		
		// Sort the output fans in the array, so that the sorting of
		// the array aligns with the appearance of the underlying
		// spans in the document.
		this._outbounds.sort((fanA, fanB) =>
		{
			const tupleA = fanLookup.get(fanA);
			const tupleB = fanLookup.get(fanB);
			
			if (tupleA === undefined || tupleB === undefined)
				throw X.Exception.unknownState();
			
			const [stmtA, stmtIdxA] = tupleA;
			const [stmtB, stmtIdxB] = tupleB;
			
			// If the top-most span of the origins of the
			// fans are located in different statements,
			// a simple comparison of the statement indexes
			// is possible.
			if (stmtIdxA < stmtIdxB)
				return -1;
			
			if (stmtIdxB < stmtIdxA)
				return 1;
			
			// At this point, statement A and statement B 
			// are actually equal.
			if (stmtA !== stmtB)
				throw X.Exception.unknownState();
			
			const annos = stmtA.annotations;
			const findMinIndex = (fan: X.Fan) =>
			{
				let minIdx = Infinity;
				
				for (const src of fan.sources)
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
			
			const fanAIdx = findMinIndex(fanA);
			const fanBIdx = findMinIndex(fanB);
			return fanAIdx - fanBIdx;
		});
	}
	
	/**
	 * @internal
	 */
	addFanSource(source: X.Span | X.InfixSpan)
	{
		const name = source.boundary.subject.toString();
		const stmt = source.statement;
		
		// If the input source is "alone", it means that it refers to
		// a statement-level annotation that has no other annotations
		// beside it (e.g. in an annotation structure looking like "D: A1, A2")
		// This is relevant, because if the source is alone, it also needs
		// to be compared against any visible total patterns.
		const sourceIsAlone =
			source instanceof X.Span && 
			source.statement.annotations.length === 1;
		
		/**
		 * Adds a fan to it's two applicable target nodes.
		 */
		const append = (fan: X.Fan) =>
		{
			this._outbounds.push(fan);
			
			for (const targetNode of fan.targets)
				targetNode._inbounds.add(fan);
		}
		
		// If there is already an existing outbound Fan, we can
		// add the new Span to the fan's list of Spans, and quit.
		// This works whether the fan is for a type or pattern.
		const existingFan = this._outbounds.find(fan => fan.name === name);
		if (existingFan)
		{
			existingFan.sources.add(source);
		}
		else
		{
			const targets: Node[] = [];
			let rationale = X.FanRationale.orphan;
			
			for (const { adjacents } of this.enumerateContainment())
			{
				const adjacentNode = adjacents.get(source.boundary.subject.toString());
				if (adjacentNode)
				{
					targets.push(adjacentNode);
					rationale = X.FanRationale.type;
				}
			}
			
			if (rationale === X.FanRationale.orphan)
			{
				for (const { adjacents } of this.enumerateContainment())
					for (const adjacentNode of adjacents.values())
						if (adjacentNode.subject instanceof X.Pattern)
							if (sourceIsAlone || !adjacentNode.subject.isTotal)
								if (adjacentNode.subject.test(name))
									targets.push(adjacentNode);
				
				if (targets.length > 0)
					rationale = X.FanRationale.pattern;
			}
			
			append(new X.Fan(this, targets, [source], "", rationale));
		}
		
		// 
		// Refresh the sums before quitting.
		// 
		
		const sumFanForInputSpanIdx = this._outbounds.findIndex(fan => 
		{
			if (fan.rationale === X.FanRationale.sum)
				for (const src of fan.sources)
					return src.statement === stmt;
			
			return false;
		});
		
		if (sumFanForInputSpanIdx > -1)
			this._outbounds.splice(sumFanForInputSpanIdx, 1);
		
		if (!sourceIsAlone)
			for (const { adjacents } of this.enumerateContainment())
				for (const adjacentNode of adjacents.values())
					if (adjacentNode.subject instanceof X.Pattern)
						if (adjacentNode.subject.isTotal)
							if (adjacentNode.subject.test(stmt.sum))
								append(new X.Fan(
									this,
									[adjacentNode],
									[],
									stmt.sum,
									X.FanRationale.sum));
	}
	
	/**
	 * Enumerates upwards through the containment
	 * hierarchy of the Nodes present in this Node's
	 * containing document, yielding the adjacents at
	 * every level, and then continues through to the
	 * root level adjacents of each of the document's
	 * dependencies.
	 */
	private *enumerateContainment()
	{
		const doc = this.document;
		const program = doc.program;
		const deps = program.documents.getDependencies(doc);
		let currentLevel: Node | null = this;
		
		do
		{
			yield {
				sourceDocument: doc,
				adjacents: currentLevel.adjacents
			};
		}
		while ((currentLevel = currentLevel.container) !== null);
		
		for (let i = deps.length; --i > 0;)
		{
			const sourceDocument = deps[i];
			
			yield {
				sourceDocument,
				adjacents: this.getRootNodes(sourceDocument)
			}
		}
	}
	
	/**
	 * Enumerates upwards through the containment
	 * hierarchy of the Nodes present in this Node's
	 * containing document, yielding each container
	 * of this Node.
	 */
	private *enumerateContainers()
	{
		let currentLevel: Node | null = this;
		
		do yield currentLevel;
		while ((currentLevel = currentLevel.container) !== null);
	}
	
	/** */
	removeFanSource(src: X.Span | X.InfixSpan)
	{
		for (let i = this._outbounds.length; --i > 0;)
			this._outbounds[i].sources.delete(src);
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
