
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
			readonly phrase: Phrase,
			readonly container: Parallel | null)
		{
			if ("DEBUG")
			{
				this.name = phrase.toString();
			
				if (this.name.startsWith("/"))
					this.name = unescape(this.name);
			}
			
			if (container !== null)
				container._contents.set(phrase.terminal, this);
		}
		
		/**
		 * @internal
		 * Stores a string representation of this Parallel,
		 * useful for debugging purposes.
		 */
		readonly name: string | undefined;
		
		/**
		 * Stores a version number for this instance,
		 * useful for debugging purposes.
		 */
		readonly version = VersionStamp.next();
		
		/**
		 * 
		 */
		get contents(): ReadonlyMap<Subject, Parallel>
		{
			return this._contents;
		}
		private _contents = new Map<Subject, Parallel>();
		
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
		
		/**
		 * Returns a string representation of this Parallel, suitable for debugging purposes.
		 */
		toString()
		{
			return this.phrase.toString();
		}
	}
}
