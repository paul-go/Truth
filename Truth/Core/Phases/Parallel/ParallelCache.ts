import * as X from "../../X";


/**
 * 
 */
export class ParallelCache
{
	/**
	 * Creates a Parallel instance from the specified Node or
	 * Uri instance. 
	 * 
	 * @throws In the case when all containing ParallelTypes to have
	 * not been created beforehand.
	 * 
	 * @throw In the case when a ParallelType corresponding to the
	 * input was already created.
	 */
	create(node: X.Node, cruft: X.CruftCache): X.SpecifiedParallel;
	create(uri: X.Uri): X.UnspecifiedParallel;
	create(key: X.Node | X.Uri, cruft?: X.CruftCache)
	{
		if (this.has(key))
			throw X.Exception.unknownState();
		
		const save = (par: X.Parallel) =>
		{
			const keyVal = this.getKeyVal(key);
			this.parallels.set(keyVal, par);
			return par;
		};
		
		const container = (() =>
		{
			if (key instanceof X.Node)
				return key.container !== null ?
					X.Not.undefined(this.get(key.container)) :
					null;
			
			return key.types.length > 1 ?
				X.Not.undefined(this.get(key.retractType(1))) :
				null;
		})();
		
		if (key instanceof X.Uri)
			return save(new X.UnspecifiedParallel(key, container));
		
		if (!(container instanceof X.SpecifiedParallel) && container !== null)
			throw X.Exception.unknownState();
		
		if (cruft === undefined)
			throw X.Exception.unknownState();
		
		const outPar = new X.SpecifiedParallel(key, container, cruft);
		if (key.intrinsicExtrinsicBridge === null)
			return save(outPar);
		
		if (this.has(key.intrinsicExtrinsicBridge))
			throw X.Exception.unknownState();
		
		const bridgePar = new X.SpecifiedParallel(
			key.intrinsicExtrinsicBridge,
			container,
			cruft);
		
		outPar.createIntrinsicExtrinsicBridge(bridgePar);
		return save(outPar);
	}
	
	/** */
	get(key: X.Uri): X.Parallel | undefined;
	get(key: X.Node): X.SpecifiedParallel | undefined;
	get(key: X.Node | X.Uri)
	{
		const keyVal = this.getKeyVal(key);
		const out = this.parallels.get(keyVal);
		
		if (key instanceof X.Node)
			if (out !== undefined)
				if (!(out instanceof X.SpecifiedParallel))
					throw X.Exception.unknownState();
		
		return out;
	}
	
	/** */
	has(key: X.Node | X.Uri)
	{
		return this.parallels.has(this.getKeyVal(key));
	}
	
	/** */
	private getKeyVal(key: X.Node | X.Uri)
	{
		const uri = key instanceof X.Node ? key.uri : key;
		return uri.toString();
	}
	
	/**
	 * Stores a map of all Parallel instances that have been
	 * constructed by this object.
	 */
	private readonly parallels = new Map<string, X.Parallel>();
	
	/** */
	get debug()
	{
		const text: string[] = [];
		
		for (const [key, value] of this.parallels)
			text.push(value.name);
		
		return text.join("\n");
	}
}
