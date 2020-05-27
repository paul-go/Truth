
namespace Truth
{
	/**
	 * 
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
			if (container !== null)
				container._contents.set(phrase.terminal, this);
		}
		
		/** @internal */
		readonly id = id();
		
		/**
		 * @internal
		 * Stores a string representation of this Parallel,
		 * useful for debugging purposes.
		 */
		get name()
		{
			let out = this.phrase.toString();
			
			return out.startsWith("/") ?
				unescape(out) :
				out;
		}
		
		/**
		 * Stores a version number for this instance,
		 * useful for debugging purposes.
		 */
		readonly version = VersionStamp.next();
		
		/**
		 * Gets the document in which this Parallel is defined.
		 */
		get document()
		{
			return this.phrase.containingDocument;
		}
		
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
			// Sanity check, this could cause a stack overflow.
			if ("DEBUG")
				if (parallel === this)
					throw Exception.unknownState();
			
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
