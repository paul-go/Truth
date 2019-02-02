import * as X from "../X";


/**
 * Universal class for handling URIs that exist within a Truth document.
 */
export class Uri
{
	/**
	 * 
	 */
	static maybeParse(value: string | Uri) : Uri | null
	{
		if (value instanceof Uri)
			return value;
		
		if (!value)
			return null;
		
		return this.tryParse(value)
	}
	
	/**
	 * 
	 */
	static tryParse(raw: string, via?: Uri | string): Uri | null
	{
		if (!raw)
			return null;
		
		const uriLike = X.UriParser.parse(raw);
		if (uriLike === null)
			return null;
		
		if (uriLike.isRelative)
		{
			if (!via)
				throw X.Exception.mustSpecifyVia();
			
			const viaParsed = this.maybeParse(via);
			if (viaParsed === null)
				throw X.Exception.invalidUri();
			
			if (viaParsed.isRelative)
				throw X.Exception.viaCannotBeRelative();
			
			const uls = uriLike.stores!;
			
			if (viaParsed.stores.length < uls.length)
				throw X.Exception.invalidUri();
			
			const stores = viaParsed.stores
				.slice(0, -uls.length)
				.concat(uls);
			
			return new X.Uri(uriLike, { stores });
		}
		
		return new Uri(uriLike);
	}
	
	/**
	 * 
	 */
	static create(value: X.Spine | Uri): Uri
	{
		if (value instanceof Uri)
			return value;
		
		const srcUri = value.document.sourceUri;
		const typeSegments = value.vertebrae
			.map(vert => new X.UriComponent(vert.toString()));
		
		return new Uri(srcUri, { types: typeSegments });
	}
	
	/**
	 * Creates an internal URI used to uniquely identify a
	 * document that exists only in memory.
	 */
	static createInternal()
	{
		const max = Number.MAX_SAFE_INTEGER;
		const ext = X.UriExtension.truth;
		
		return new Uri({
			protocol: X.UriProtocol.internal,
			file: Math.floor(Math.random() * max).toString(36) + ext,
			ext
		});
	}
	
	/**
	 * @internal
	 */
	private constructor(...uriLike: Partial<Uri>[])
	{
		for (const uriProps of uriLike)
			Object.assign(this, uriProps);
		
		Object.freeze(this.stores);
		Object.freeze(this.types);
		Object.freeze(this);
	}
	
	/**
	 * 
	 */
	readonly protocol: X.UriProtocol = X.UriProtocol.file;
	
	/**
	 * Stores the name of the file referenced in the URI, including any extension.
	 */
	readonly file: string = "";
	
	/**
	 * Stores the extension of the file referenced in the URI, if any.
	 */
	readonly ext: X.UriExtension = X.UriExtension.truth;
	
	/**
	 * Stores the store-side components of this URI.
	 */
	readonly stores: ReadonlyArray<X.UriComponent> = [];
	
	/**
	 * Stores the type-side components of this URI.
	 */
	readonly types: ReadonlyArray<X.UriComponent> = [];
	
	/**
	 * Stores the number of retractions that are defined in this
	 * URI, in the case when the URI is relative.
	 */
	readonly retractionCount: number = -1;
	
	/**
	 * 
	 */
	get isRelative() { return this.retractionCount >= 0; }
	
	/**
	 * Creates a new Uri whose path of types is
	 * retracted by the specified number of levels
	 * of depth.
	 */
	retractType(factor: number): Uri
	{
		const types = this.types.slice(0, -factor);
		return new Uri(this, { types });
	}
	
	/**
	 * Creates a new Uri, whose path of types is
	 * retracted to the specified level of depth.
	 */
	retractTypeTo(depth: number): Uri
	{
		return depth < this.types.length ?
			this.retractType(this.types.length - depth) :
			this;
	}
	
	/**
	 * Creates a new Uri whose path of stores is
	 * retracted by the specified number of levels
	 * of depth.
	 */
	retractStore(factor: number): Uri
	{
		const folders = this.stores.slice(0, -factor);
		return new Uri(this, { stores: folders });
	}
	
	/**
	 * Creates a new Uri, whose path of folders is
	 * retracted to the specified level of depth.
	 */
	retractStoreTo(depth: number): Uri
	{
		return depth < this.stores.length ?
			this.retractType(this.stores.length - depth) :
			this;
	}
	
	/**
	 * 
	 */
	extendType(additionalTypes: string | string[]): Uri
	{
		if (!additionalTypes)
			return new Uri(this);
		
		const types = typeof additionalTypes === "string" ?
			[new X.UriComponent(additionalTypes)] :
			additionalTypes.map(t => new X.UriComponent(t));
		
		return new Uri(this, { types });
	}
	
	/**
	 * 
	 */
	extendStore(additionalStores: string | string[]): Uri
	{
		if (!additionalStores)
			return new Uri(this);
		
		const stores = typeof additionalStores === "string" ?
			[new X.UriComponent(additionalStores)] :
			additionalStores.map(s => new X.UriComponent(s));
		
		return new Uri(this, { stores });
	}
	
	/**
	 * @returns A boolean value that indicates whether this
	 * Uri is structurally equivalent to the specified Uri.
	 */
	equals(other: Uri, compareTypes?: boolean): boolean
	{
		if (this === other)
			return true;
		
		if (compareTypes)
			if (this.toTypeString() !== other.toTypeString())
				return false;
		
		return this.toStoreString() === other.toStoreString();
	}
	
	/**
	 * @returns The path of types contained by this URI, 
	 * concatenated into a single string.
	 */
	toTypeString()
	{
		return this.types.map(t => t.value)
			.join(X.UriSyntax.componentSeparator);
	}
	
	/**
	 * @returns The path of stores contained by this URI, 
	 * concatenated into a single string.
	 */
	toStoreString()
	{
		return this.stores.map(t => t.toStringEncoded())
			.join(X.UriSyntax.componentSeparator);
	}
	
	/**
	 * 
	 */
	toString()
	{
		let out = this.toStoreString();
		
		if (this.types.length > 0)
			out += X.UriSyntax.typeSeparator + this.toTypeString();
		
		return out;
	}
}
