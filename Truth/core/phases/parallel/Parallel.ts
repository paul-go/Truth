
namespace Truth
{
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
			readonly uri: Uri,
			readonly container: Parallel | null)
		{
			this.name = uri.toTypeString();
			
			if (this.name.startsWith("/"))
				this.name = unescape(this.name);
			
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
		readonly version = VersionStamp.next();
		
		/**
		 * 
		 */
		get contents(): ReadonlyMap<string, Parallel>
		{
			return this._contents;
		}
		private _contents = new Map<string, Parallel>();
		
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
		addParallel(parallel: Parallel)
		{
			if (!this._parallels.includes(parallel))
				this._parallels.push(parallel);
		}
	}
}
