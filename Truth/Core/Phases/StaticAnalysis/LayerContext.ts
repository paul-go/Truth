import * as X from "../../X";


/**
 * A class that stores constructed Layers.
 */
export class LayerContext
{
	/** */
	constructor(private readonly program: X.Program) { }
	
	/**
	 * Retrieves the Layer that corresponds to the specified URI.
	 * If a corresponding Layer has not already been constructed
	 * in this context, a new one is constructed and returned.
	 */
	maybeConstruct(directive: X.Uri)
	{
		const typePath = directive.typePath.slice();
		if (typePath.length === 0)
			throw X.Exception.invalidArgument();
		
		const directiveText = directive.toString(true, true);
		if (this._layers.has(directiveText))
			return X.Guard.defined(this._layers.get(directiveText));
		
		const sourceDoc = this.program.documents.get(directive);
		if (sourceDoc === null)
			throw X.Exception.invalidArgument();
		
		const genesisName = typePath[0];
		const genesisNode = this.program.graph.read(
			sourceDoc,
			genesisName);
		
		if (genesisNode === null)
			return null;
		
		const typePathText = typePath.join("/");
		let lastLayer: X.Layer | null = null;
		
		for (let i = -1; ++i < typePath.length;)
		{
			const uri = directive.retractTo(i + 1);
			const uriText = uri.toString(true, true);
			const typeName = typePath[i];
			
			const nextLayer = ((): X.Layer | null =>
			{
				const existingLayer = this.layers.get(uriText);
				if (existingLayer)
					return existingLayer;
				
				if (lastLayer === null)
				{
					const layer = new X.Layer(lastLayer, uri, this);
					this._layers.set(uriText, layer);
					layer.bootstrap(genesisNode);
					return layer;
				}
				else
				{
					const layer = lastLayer.descend(typeName);
					this._layers.set(uriText, layer);
					return layer;
				}
			})();
			
			if (nextLayer === null)
				return null;
			
			nextLayer.analyze();
			nextLayer.debug();
			lastLayer = nextLayer;
		}
		
		return lastLayer;
	}
	
	/**
	 * Gets a map of objects that should each be converted
	 * into a type, which are indexed by a string representation
	 * of the associated type URI. Each object translates into
	 * another component specified in the type URI provided
	 * in the constructor of this object.
	 */
	get layers(): ReadonlyMap<string, X.Layer | null>
	{
		return this._layers;
	}
	private _layers = new Map<string, X.Layer | null>();
	
	/**
	 * Gets an array that contains the faults that have been
	 * identified during the lifecycle of this construction context.
	 */
	get faults()
	{
		return Object.freeze(this._faults.slice());
	}
	private readonly _faults: X.Fault[] = [];
	
	/** */
	selectSuccessor(successor: X.Successor)
	{
		this.selectedSuccessors.add(successor);
	}
	
	/** */
	getSelectedSuccesor(hyperEdge: X.HyperEdge)
	{
		switch (hyperEdge.successors.length)
		{
			case 0: return null;
			case 1: return hyperEdge.successors[0];
		}
		
		return hyperEdge.successors.find(scsr =>
			this.selectedSuccessors.has(scsr)) || null;
	}
	
	/** */
	private readonly selectedSuccessors = new Set<X.Successor>();
	
	/** */
	addCruft(cruft: X.Node | X.Statement | X.Span | X.InfixSpan)
	{
		// Implement
	}
	
	/** */
	isCruft(cruft: X.Node | X.Statement | X.Span | X.InfixSpan)
	{
		// Implement
		return false;
	}
}
