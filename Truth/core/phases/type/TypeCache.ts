
namespace Truth
{
	/**
	 * @internal
	 */
	export type TCachedType = Type | TypeProxy | null;
	
	/**
	 * @internal
	 */
	export class TypeCache
	{
		/** */
		static has(phrase: Phrase)
		{
			const cache = this.getCache(phrase.containingDocument.program);
			return cache.map.has(phrase);
		}
		
		/** */
		static get(phrase: Phrase)
		{
			const program = phrase.containingDocument.program;
			const cache = this.getCache(program);
			if (cache.map.has(phrase))
				return Not.undefined(cache.map.get(phrase));
			
			const proxy = new TypeProxy(phrase);
			this.set(phrase, proxy);
			return proxy;
		}
		
		/** */
		static set(phrase: Phrase, type: TCachedType): TCachedType
		{
			const cache = this.getCache(phrase.containingDocument.program);
			cache.map.set(phrase, type);
			return type;
		}
		
		/** */
		private static getCache(program: Program)
		{
			const cache = this.allCaches.get(program) || (() =>
			{
				const cache = new TypeCache(program);
				this.allCaches.set(program, cache);
				return cache;
			})();
			
			cache.maybeClear();
			return cache;
		}
		
		/**
		 * 
		 */
		private static readonly allCaches = new WeakMap<Program, TypeCache>();
		
		/** */
		private constructor(private readonly program: Program)
		{
			this.version = program.version;
		}
		
		/** */
		private maybeClear()
		{
			if (this.program.version.newerThan(this.version))
			{
				this.map.clear();
				this.version = this.program.version;
			}
		}
		
		/** */
		private version: VersionStamp;
		
		/** */
		private readonly map = new Map<Phrase, TCachedType>();
	}
}
