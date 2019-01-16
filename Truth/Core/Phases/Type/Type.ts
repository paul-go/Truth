import * as X from "../../X";


/**
 * A class that represents a fully constructed type within the program.
 */
export class Type
{
	/** @internal */
	static construct(uri: X.Uri, program: X.Program): Type | null;
	static construct(spine: X.Spine, program: X.Program): Type;
	static construct(param: X.Uri | X.Spine, program: X.Program): Type | null
	{
		const uri = X.Uri.create(param);
		if (uri.typePath.length === 0)
			return null;
		
		if (X.TypeCache.has(uri, program))
		{
			const cached = X.TypeCache.get(uri, program);
			
			// If the cached type exists, but hasn't been compiled yet,
			// we can't return it, we need to compile it first.
			if (!(cached instanceof X.TypeProxy))
				return cached;
		}
		
		const types: X.Type[] = [];
		const context = new X.LayerContext(program);
		let lastType: X.Type | null = null;
		
		context.maybeConstruct(uri);
		
		for (let i = -1; ++i < uri.typePath.length;)
		{
			const currentUri = uri.retractTo(i);
			const currentUriText = currentUri.toString(true, true);
			const layer = context.layers.get(currentUriText);
			
			if (layer)
			{
				const typeInfo: ITypeInfo = {
					uri,
					container: lastType
				};
				
				const type = new Type(typeInfo);
				X.TypeCache.set(currentUri, program, type);
				types.push(type);
				lastType = type;
			}
			else
			{
				X.TypeCache.set(currentUri, program, null);
				return null;
			}
		}
		
		return lastType;
	}
	
	/**
	 * 
	 */
	private constructor(info: ITypeInfo)
	{
		this.name = info.uri.typePath[info.uri.typePath.length - 1];
		this.uri = info.uri;
		//this.faults = Object.freeze(info.faults || []);
		this.container = info.container;
		this.parallels = Object.freeze(info.parallels || []);
		this._generals = new X.TypeProxyArray(info.generals || []);
		this._listPortal = info.listPortal || null;
		this.isListIntrinsic = info.isListIntrinsic || false;
		this.isListExtrinsic = info.isListExtrinsic || false;
		this.isAnonymous = info.isAnonymous || false;
		this.isPattern = info.isPattern || false;
		this.isUri = info.isUri || false;
	}
	
	/**
	 * Stores a text representation of the name of the type,
	 * or a serialized version of the pattern content in the
	 * case when the type is actually a pattern.
	 */
	readonly name: string;
	
	/**
	 * Stores the URI that specifies where this Type was
	 * found in the document.
	 */
	readonly uri: X.Uri;
	
	/**
	 * Stores a reference to the type, as it's defined in it's
	 * next most applicable 
	 */
	readonly parallels: ReadonlyArray<X.Type>;
	
	/**
	 * Stores the Type that contains this Type, or null in
	 * the case when this Type is top-level.
	 */
	readonly container: X.Type | null;
	
	/**
	 * 
	 */
	get contents()
	{
		// The behavior of this method is similar to constructAdjacents,
		// but with the distinction that the contents of the floor terrace
		// turns are collected rather than the floor turns themselves.
		// This method may also support a filtering method to find one
		// single contained node.
		
		if (this._contents !== null)
			return this._contents;
		
		return this._contents = Object.freeze([]);
	}
	private _contents: ReadonlyArray<X.Type> | null = null;
	
	/**
	 * Stores the array of types from which this type extends.
	 * If this Type extends from a pattern, it is included in this
	 * array.
	 */
	get generals()
	{
		return this._generals.maybeCompile();
	}
	
	/** @internal */
	private readonly _generals: X.TypeProxyArray;
	
	/**
	 * 
	 */
	get metaphors()
	{
		if (this._metaphors !== null)
			return this._metaphors;
		
		return this._metaphors = Object.freeze([]);
	}
	private _metaphors: ReadonlyArray<X.Type> | null = null;
	
	/**
	 * 
	 */
	get specifics()
	{
		if (this._specifics !== null)
			return this._specifics;
		
		return this._specifics = Object.freeze([]);
	}
	private _specifics: ReadonlyArray<X.Type> | null = null;
	
	/**
	 * 
	 */
	get adjacents()
	{
		// Adjacents need to be constructed in two steps. The first
		// step is to get the names of all the adjacent types (which
		// basically means get their URIs. The second step is to actually
		// construct these types. However, some services don't actually
		// need the fully constructed type (suggestions windows), they
		// just need the names initially. So API consumers should have
		// the ability to do either of these.
		
		if (this._adjacents !== null)
			return this._adjacents;
		
		return this._adjacents = Object.freeze([]);
	}
	private _adjacents: ReadonlyArray<Type> | null = null;
	
	/**
	 * 
	 */
	get patterns()
	{
		if (this._patterns !== null)
			return this._patterns;
		
		// This is only going to return the patterns for the immediate
		// type scope, not the ones that exist deeply
		return this._patterns = this.adjacents
			.filter(type => type.isPattern)
			.filter(type => type.generals.includes(this));
	}
	private _patterns: ReadonlyArray<X.Type> | null = null;
	
	/**
	 * Gets a map of raw string values representing the
	 * type aliases with which this type has been annotated,
	 * which are keyed by the type to which they resolve.
	 */
	get values()
	{
		if (this._values !== null)
			return this._values;
		
		return this._values = new Map();
	}
	private _values: ReadonlyMap<X.Type, string> | null = null;
	
	/**
	 * Stores a reference to the intrinsic side of the list when
	 * this type represents the extrinsic side of a list, or vice
	 * versa. Stores null in the case when the type is not a list.
	 */
	get listPortal()
	{
		return this._listPortal !== null ?
			this._listPortal.maybeCompile() :
			null;
	}
	
	/** @internal */
	private readonly _listPortal: X.TypeProxy | null;
	
	/**
	 * Stores whether this type represents the intrinsic
	 * side of a list.
	 */
	readonly isListIntrinsic: boolean;
	
	/**
	 * Stores whether this type represents the extrinsic
	 * side of a list.
	 */
	readonly isListExtrinsic: boolean;
	
	/** */
	get isFresh() { return this.generals.length > 0; }
	
	/** */
	get isOverride() { return this.parallels.length > 0; }
	
	/** */
	get isIntroduction() { return this.parallels.length === 0; }
	
	/** */
	readonly isAnonymous: boolean;
	
	/** */
	readonly isPattern: boolean;
	
	/** */
	readonly isUri: boolean;
	
	/**
	 * 
	 */
	//readonly faults: ReadonlyArray<X.Fault>;
}


/**
 * 
 */
interface ITypeInfo
{
	uri: X.Uri;
	parallels?: ReadonlyArray<X.Type>;
	generals?: ReadonlyArray<X.TypeProxy>;
	container: X.Type | null;
	listPortal?: X.TypeProxy;
	isListIntrinsic?: boolean;
	isListExtrinsic?: boolean;
	isAnonymous?: boolean;
	isPattern?: boolean;
	isUri?: boolean;
	//faults?: ReadonlyArray<X.Fault>;
}
