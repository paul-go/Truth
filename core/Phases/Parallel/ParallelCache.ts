
namespace Truth
{
	type ParallelKind = ExplicitParallel | ImplicitParallel;
	type ParallelsMap = ContingentMap<number, ParallelKind>;
	
	/**
	 * @internal
	 */
	export class ParallelCache
	{
		/** */
		constructor(program: Program)
		{
			this.parallels = new ContingentMap(program);
		}
		
		/**
		 * Creates and returns an ExplicitParallel, and adds it to the
		 * internal cache.
		 */
		createExplicit(phrase: Phrase, cruft: CruftCache)
		{
			if (phrase.isHypothetical)
				throw Exception.unknownState();
			
			return this.innerCreate(phrase, cruft) as ExplicitParallel;
		}
		
		/**
		 * Creates and returns an ImplicitParallel, and adds it to the
		 * internal cache.
		 */
		createImplicit(phrase: Phrase)
		{
			if (!phrase.isHypothetical)
				throw Exception.unknownState();
			
			return this.innerCreate(phrase) as ImplicitParallel;
		}
		
		/**
		 * Creates an implicit or explicit parallel, and stores it in the cache.
		 * 
		 * @throws In the case when all containing Parallels have not been
		 * created before invoking this method, or when a Parallel
		 * corresponding to the input was already created.
		 */
		private innerCreate(phrase: Phrase, cruft?: CruftCache)
		{
			if (this.has(phrase) || phrase.isDocumentOwned)
				throw Exception.unknownState();
			
			const save = (par: ExplicitParallel | ImplicitParallel) =>
			{
				this.parallels.set(phrase.id, par, par.document);
				return par;
			};
			
			const container = this.get(phrase.parent) || null;
			
			if (phrase.isHypothetical)
				return save(new ImplicitParallel(phrase, container));
			
			if (!(container instanceof ExplicitParallel) && container !== null)
				throw Exception.unknownState();
			
			if (cruft === undefined)
				throw Exception.unknownState();
			
			const outPar = new ExplicitParallel(phrase, container, cruft);
			if (phrase.intrinsicExtrinsicBridge === null)
				return save(outPar);
			
			if (this.has(phrase.intrinsicExtrinsicBridge))
				throw Exception.unknownState();
			
			const bridgePar = new ExplicitParallel(
				phrase.intrinsicExtrinsicBridge,
				container,
				cruft);
			
			outPar.createIntrinsicExtrinsicBridge(bridgePar);
			return save(outPar);
		}
		
		/** Gets the Parallel associated with the specified Phrase. */
		get(phrase: Phrase)
		{
			return this.parallels.get(phrase.id);
		}
		
		/** Gets the ExplicitParallel associated with the specified Phrase. */
		getExplicit(phrase: Phrase)
		{
			if (phrase.isHypothetical)
				throw Exception.invalidArgument();
			
			const parallel = this.parallels.get(phrase.id);
			if (parallel instanceof ImplicitParallel)
				throw Exception.unknownState();
				
			return parallel;
		}
		
		/** */
		has(key: Phrase)
		{
			return !!this.parallels.get(key.id);
		}
		
		/**
		 * Stores a map of all Parallel objects that have been constructed,
		 * keyed by the ID of the Phrase to which they correspond.
		 */
		private readonly parallels: ParallelsMap;
	}
}
