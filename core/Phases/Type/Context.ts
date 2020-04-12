
namespace Truth
{
	/**
	 * @internal
	 * Stores supporting information for Type objects.
	 * The information stored in this class must have the same lifetime as
	 * the program object that contains the type, rather than the type itself.
	 */
	export class Context
	{
		/** */
		constructor(readonly program: Program)
		{
			this.phrases = new PhraseProvider();
			this.worker = new ConstructionWorker(program, this.phrases);
			this._version = program.version;
		}
		
		/**
		 * Clears out all information in this context.
		 * This method should be called when the program is modified,
		 * and the cached information is therefore no longer valid.
		 */
		reset()
		{
			this.typesForPhrases.clear();
			this.typesForTerms.clear();
			this.subs.clear();
			this.subvisors.clear();
			this.worker.reset();
			this._version = this.program.version;
		}
		
		/** */
		get version()
		{
			return this._version;
		}
		private _version: VersionStamp;
		
		/** */
		readonly worker: ConstructionWorker;
		
		/** */
		readonly phrases: PhraseProvider;
		
		/** */
		readonly typesForPhrases = new Map<Phrase, Type>();
		
		/** */
		readonly typesForTerms = new MultiMap<string, Type>();
		
		/**
		 * Stores a cache of the sub types of each constructed type.
		 * This MultiMap is constructed progressively as more types are constructed.
		 */
		readonly subs = new SetMap<Type, Type>();
		
		/**
		 * Stores a cache of the subvisors of each constructed type.
		 * This MultiMap is constructed progressively as more types are constructed.
		 */
		readonly subvisors = new SetMap<Type, Type>();
	}
}
