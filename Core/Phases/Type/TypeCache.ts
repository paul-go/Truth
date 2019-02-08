import * as X from "../../X";


/**
 * @internal
 */
export type TCachedType = X.Type | X.TypeProxy | null;


/**
 * @internal
 */
export class TypeCache
{
	/** */
	static has(uri: X.Uri, program: X.Program)
	{
		const cache = this.getCache(program);
		const uriText = uri.toString();
		return cache.map.has(uriText);
	}
	
	/** */
	static get(uri: X.Uri, program: X.Program)
	{
		const cache = this.getCache(program);
		const uriText = uri.toString();
		
		if (cache.map.has(uriText))
			return X.Guard.defined(cache.map.get(uriText));
		
		const proxy = new X.TypeProxy(uri, program);
		this.set(uri, program, proxy);
		return proxy;
	}
	
	/** */
	static set(uri: X.Uri, program: X.Program, type: TCachedType): TCachedType
	{
		const cache = this.getCache(program);
		const uriText = uri.toString();
		cache.map.set(uriText, type);
		return type;
	}
	
	/** */
	private static getCache(program: X.Program)
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
	private static readonly allCaches = new WeakMap<X.Program, TypeCache>();
	
	/** */
	private constructor(private readonly program: X.Program)
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
	private version: X.VersionStamp;
	
	/** */
	private readonly map = new Map<string, TCachedType>();
}
