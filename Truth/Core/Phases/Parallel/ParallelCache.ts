
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
		create(node: Node, cruft: CruftCache): SpecifiedParallel;
		create(uri: Uri): UnspecifiedParallel;
		create(key: Node | Uri, cruft?: CruftCache)
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
				
				return key.types.length > 1 ?
					Not.undefined(this.get(key.retractType(1))) :
					null;
			})();
			
			if (key instanceof Uri)
				return save(new UnspecifiedParallel(key, container));
			
			if (!(container instanceof SpecifiedParallel) && container !== null)
				throw Exception.unknownState();
			
			if (cruft === undefined)
				throw Exception.unknownState();
			
			const outPar = new SpecifiedParallel(key, container, cruft);
			if (key.intrinsicExtrinsicBridge === null)
				return save(outPar);
			
			if (this.has(key.intrinsicExtrinsicBridge))
				throw Exception.unknownState();
			
			const bridgePar = new SpecifiedParallel(
				key.intrinsicExtrinsicBridge,
				container,
				cruft);
			
			outPar.createIntrinsicExtrinsicBridge(bridgePar);
			return save(outPar);
		}
		
		/** */
		get(key: Uri): Parallel | undefined;
		get(key: Node): SpecifiedParallel | undefined;
		get(key: Node | Uri)
		{
			const keyVal = this.getKeyVal(key);
			const out = this.parallels.get(keyVal);
			
			if (key instanceof Node)
				if (out !== undefined)
					if (!(out instanceof SpecifiedParallel))
						throw Exception.unknownState();
			
			return out;
		}
		
		/** */
		has(key: Node | Uri)
		{
			return this.parallels.has(this.getKeyVal(key));
		}
		
		/** */
		private getKeyVal(key: Node | Uri)
		{
			const uri = key instanceof Node ? key.uri : key;
			return uri.toString();
		}
		
		/**
		 * Stores a map of all Parallel instances that have been
		 * constructed by this object.
		 */
		private readonly parallels = new Map<string, Parallel>();
		
		/** */
		get debug()
		{
			const text: string[] = [];
			
			for (const [key, value] of this.parallels)
				text.push(value.name);
			
			return text.join("\n");
		}
	}
}
