
namespace Truth
{
	/**
	 * @internal
	 */
	export class ParallelCache
	{
		/**
		 * 
		 */
		createExplicit(phrase: Phrase, cruft: CruftCache)
		{
			if (phrase.isHypothetical)
				throw Exception.unknownState();
			
			return this.innerCreate(phrase, cruft) as ExplicitParallel;
		}
		
		/**
		 * 
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
		 * @throws In the case when all containing ParallelTypes to have
		 * not been created beforehand.
		 * 
		 * @throw In the case when a ParallelType corresponding to the
		 * input was already created.
		 */
		private innerCreate(phrase: Phrase, cruft?: CruftCache)
		{
			if (this.has(phrase) || phrase.isRoot)
				throw Exception.unknownState();
			
			const save = (par: ExplicitParallel | ImplicitParallel) =>
			{
				this.parallels.set(phrase, par);
				return par;
			};
			
			const container = Not.undefined(this.get(phrase.parent));
			
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
			return this.parallels.get(phrase);
		}
		
		/** Gets the ExplicitParallel associated with the specified Phrase.  */
		getExplicit(phrase: Phrase)
		{
			if (phrase.isHypothetical)
				throw Exception.invalidArgument();
			
			const parallel = this.parallels.get(phrase);
			if (parallel instanceof ImplicitParallel)
				throw Exception.unknownState();
				
			return parallel;
		}
		
		/** */
		has(key: Phrase)
		{
			return this.parallels.has(key);
		}
		
		/**
		 * Stores a map of all Parallel objects that have been constructed,
		 * keyed by the Phrase to which they correspond.
		 */
		private readonly parallels = new Map<Phrase, ExplicitParallel | ImplicitParallel>();
		
		/** */
		get debug()
		{
			const text: string[] = [];
			
			for (const parallel of this.parallels.values())
				text.push(parallel.name || "(undefined)");
			
			return text.join("\n");
		}
	}
}
