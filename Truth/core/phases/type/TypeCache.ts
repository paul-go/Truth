
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
		static has(uri: Uri, program: Program)
		{
			const cache = this.getCache(program);
			const uriText = uri.toString();
			return cache.map.has(uriText);
		}
		
		/** */
		static get(uri: Uri, program: Program)
		{
			const cache = this.getCache(program);
			const uriText = uri.toString();
			
			if (cache.map.has(uriText))
				return Not.undefined(cache.map.get(uriText));
			
			const proxy = new TypeProxy(uri, program);
			this.set(uri, program, proxy);
			return proxy;
		}
		
		/** */
		static set(uri: Uri, program: Program, type: TCachedType): TCachedType
		{
			const cache = this.getCache(program);
			const uriText = uri.toString();
			cache.map.set(uriText, type);
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
		private readonly map = new Map<string, TCachedType>();
	}
}
