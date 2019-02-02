import * as X from "../../X";


/**
 * 
 */
export abstract class Parallel
{
	/**
	 * @internal
	 * Invoked by ParallelCache. Do not call.
	 */
	constructor(
		readonly uri: X.Uri,
		readonly container: X.Parallel | null)
	{
		this.name = uri.toTypeString();
		
		if (container !== null)
			container._contents.set(uri.types.slice(-1)[0].value, this);
	}
	
	/**
	 * Stores a string representation of this Parallel,
	 * useful for debugging purposes.
	 */
	readonly name: string;
	
	/**
	 * Stores a version number for this instance,
	 * useful for debugging purposes.
	 */
	readonly version = X.VersionStamp.next();
	
	/**
	 * 
	 */
	get contents(): ReadonlyMap<string, X.Parallel>
	{
		return this._contents;
	}
	private _contents = new Map<string, X.Parallel>();
	
	/** */
	getParallels()
	{
		return Object.freeze(this._parallels.slice());
	}
	private readonly _parallels: Parallel[] = [];
	
	/** */
	get hasParallels()
	{
		return this._parallels.length > 0;
	}
	
	/** */
	addParallel(parallel: X.Parallel)
	{
		if (!this._parallels.includes(parallel))
			this._parallels.push(parallel);
	}
}
