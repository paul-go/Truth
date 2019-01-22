import * as X from "../../X";


/**
 * 
 */
export class ParallelCache
{
	/**
	 * Creates a ParaType instance from the specified Node or
	 * Uri instance. 
	 * 
	 * @throws In the case when all containing ParaTypes to have
	 * not been created beforehand.
	 * 
	 * @throw In the case when a ParaType corresponding to the
	 * input was already created.
	 */
	create(node: X.Node, cruft: X.CruftCache): X.SpecifiedParallel;
	create(uri: X.Uri): X.UnspecifiedParallel;
	create(key: X.Node | X.Uri, cruft?: X.CruftCache)
	{
		if (this.has(key))
			throw X.Exception.unknownState();
		
		const container = (() =>
		{
			if (key instanceof X.Node)
				return key.container !== null ?
					X.Guard.defined(this.get(key.container)) :
					null;
			
			return key.typePath.length > 1 ?
				X.Guard.defined(this.get(key.retract(0, 1))) :
				null;
		})();
		
		const par = (() =>
		{
			if (key instanceof X.Node)
			{
				if (!(container instanceof X.SpecifiedParallel) && container !== null)
					throw X.Exception.unknownState();
				
				if (cruft === undefined)
					throw X.Exception.unknownState();
				
				return new X.SpecifiedParallel(key, container, cruft);
			}
			
			return new X.UnspecifiedParallel(key, container);
		})();
		
		const keyVal = this.getKeyVal(key);
		this.parallels.set(keyVal, par);
		return par;
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
		return uri.toString(true, true);
	}
	
	/**
	 * Stores a map of all Parallel instances that have been
	 * constructed by this object.
	 */
	private readonly parallels = new Map<string, X.Parallel>();
}
