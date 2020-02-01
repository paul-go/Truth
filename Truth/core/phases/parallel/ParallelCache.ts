
namespace Truth
{
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
		create(node: Node, cruft: CruftCache): ExplicitParallel;
		create(phrase: Phrase): ImplicitParallel;
		create(key: Node | Phrase, cruft?: CruftCache)
		{
			if (this.has(key))
				throw Exception.unknownState();
			
			const save = (par: Parallel) =>
			{
				const keyVal = this.getKeyVal(key);
				this.parallels.set(keyVal, par);
				return par;
			};
			
			const container = (() =>
			{
				if (key instanceof Node)
					return key.container !== null ?
						Not.undefined(this.get(key.container)) :
						null;
				
				return key.length > 1 ?
					Not.undefined(this.get(key.back())) :
					null;
			})();
			
			if (key instanceof Phrase)
				return save(new ImplicitParallel(key, container));
			
			if (!(container instanceof ExplicitParallel) && container !== null)
				throw Exception.unknownState();
			
			if (cruft === undefined)
				throw Exception.unknownState();
			
			const outPar = new ExplicitParallel(key, container, cruft);
			if (key.intrinsicExtrinsicBridge === null)
				return save(outPar);
			
			if (this.has(key.intrinsicExtrinsicBridge))
				throw Exception.unknownState();
			
			const bridgePar = new ExplicitParallel(
				key.intrinsicExtrinsicBridge,
				container,
				cruft);
			
			outPar.createIntrinsicExtrinsicBridge(bridgePar);
			return save(outPar);
		}
		
		/** */
		get(key: Phrase): Parallel | undefined;
		get(key: Node): ExplicitParallel | undefined;
		get(key: Node | Phrase)
		{
			const keyVal = this.getKeyVal(key);
			const out = this.parallels.get(keyVal);
			
			if (key instanceof Node)
				if (out !== undefined)
					if (!(out instanceof ExplicitParallel))
						throw Exception.unknownState();
			
			return out;
		}
		
		/** */
		has(key: Node | Phrase)
		{
			return this.parallels.has(this.getKeyVal(key));
		}
		
		/** */
		private getKeyVal(key: Node | Phrase)
		{
			return key instanceof Node ? key.phrase : key;
		}
		
		/**
		 * Stores a map of all Parallel objects that have been constructed,
		 * keyed by the Phrase to which they correspond.
		 */
		private readonly parallels = new Map<Phrase, Parallel>();
		
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
