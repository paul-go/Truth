
namespace Truth
{
	/**
	 * Universal class for handling URIs that exist within a Truth document.
	 */
	export class Uri
	{
		/**
		 * Constructs a new Uri instance that points to a (possibly nested)
		 * type defined in the specified document.
		 */
		static from(document: Document, ...types: string[])
		{
			return document.sourceUri.extendType(types);
		}
		
		/**
		 * Attempts to parse the specified string or Uri into
		 * another Uri instance. If the parameter is already
		 * a Uri, it is returned without further processing.
		 */
		static maybeParse(value: string | Uri): Uri | null
		{
			if (value instanceof Uri)
				return value;
			
			if (!value)
				return null;
			
			return this.tryParse(value);
		}
		
		/**
		 * Attempts to parse the specified string into a Uri instance.
		 * Returns null in the case when the Uri could not be parsed.
		 */
		static tryParse(uri: string | Uri, via?: Uri | string): Uri | null
		{
			if (!uri)
				return null;
			
			const uriLike = typeof uri === "string" ?
				Truth.parseUri(uri) :
				uri;
			
			if (uriLike === null)
				return null;
			
			const outUri = (() =>
			{
				if (!(uriLike.isRelative && via))
					return new Uri(uriLike);
				
				const viaParsed = typeof via === "string" ?
					Truth.parseUri(via) :
					via;
				
				if (viaParsed === null)
					throw Exception.invalidUri();
				
				if (viaParsed.isRelative)
					throw Exception.viaCannotBeRelative();
				
				const uriStores = Not.undefined(uriLike.stores);
				const viaStores = Not.undefined(viaParsed.stores);
				const retract = uriLike.retractionCount || 0;
				
				if (viaStores.length < retract)
					throw Exception.invalidUri();
				
				return new Uri(uriLike, {
					protocol: viaParsed.protocol,
					stores: retract > 0 ?
						viaStores.slice(0, -retract).concat(uriStores) :
						viaStores.concat(uriStores),
					retractionCount: -1,
					isRelative: false
				});
			})();
			
			// Return null when an extension was found that isn't
			// unknown (also when no extension was found). This
			// is in order to reduce the number of terms that have
			// a special meaning in a truth document.
			if (outUri.ext === UriExtension.unknown)
				return null;
			
			// You can't have a type path that points to a 
			// non-truth file, so null is returned in this case.
			if (outUri.types.length > 0)
				if (outUri.ext !== UriExtension.truth)
					return null;
			
			return outUri;
		}
		
		/**
		 * Copies the specified URI or Spine into another URI instance.
		 */
		static clone(value: Spine | Uri): Uri
		{
			if (value instanceof Uri)
				return value;
			
			const srcUri = value.document.sourceUri;
			const typeSegments = value.vertebrae.map(vert =>
				new UriComponent(vert.toString(true)));
			
			return new Uri(srcUri, { types: typeSegments });
		}
		
		/**
		 * @internal
		 * Creates an internal URI used to uniquely identify a
		 * document that exists only in memory.
		 */
		static createInternal()
		{
			const max = Number.MAX_SAFE_INTEGER;
			const ext = UriExtension.truth;
			
			return new Uri({
				protocol: UriProtocol.internal,
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
		 * @internal
		 * Debugging utility. Do not use.
		 */
		private get value() { return this.toTypeString(); }
		
		/**
		 * 
		 */
		readonly protocol: UriProtocol = UriProtocol.file;
		
		/**
		 * Stores the name of the file referenced in the URI, including any extension.
		 */
		readonly file: string = "";
		
		/**
		 * Stores the extension of the file referenced in the URI, if any.
		 */
		readonly ext: UriExtension = UriExtension.truth;
		
		/**
		 * Stores the store-side components of this URI.
		 * Excludes the file name.
		 */
		readonly stores: readonly UriComponent[] = [];
		
		/**
		 * Stores the type-side components of this URI.
		 */
		readonly types: readonly UriComponent[] = [];
		
		/**
		 * Stores the number of retractions that are defined in this
		 * URI, in the case when the URI is relative.
		 */
		readonly retractionCount: number = 0;
		
		/**
		 * Stores whether the URI is a relative path.
		 */
		readonly isRelative: boolean = false;
		
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
		extendType(additionalTypeNames: string | readonly string[]): Uri
		{
			if (!additionalTypeNames)
				return new Uri(this);
			
			const components = typeof additionalTypeNames === "string" ?
				[new UriComponent(additionalTypeNames)] :
				additionalTypeNames.map(t => new UriComponent(t));
			
			return new Uri(this, { types: this.types.concat(components) });
		}
		
		/**
		 * 
		 */
		extendStore(additionalStores: string | readonly string[]): Uri
		{
			if (!additionalStores)
				return new Uri(this);
			
			const stores = typeof additionalStores === "string" ?
				[new UriComponent(additionalStores)] :
				additionalStores.map(s => new UriComponent(s));
			
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
			{
				if (this.types.length !== other.types.length)
					return false;
				
				if (this.types.some((t, i) => t.value !== other.types[i].value))
					return false;
			}
			
			if (this.protocol !== other.protocol)
				return false;
			
			if (this.stores.some((s, i) => s.value !== other.stores[i].value))
				return false;
			
			return true;
		}
		
		/**
		 * 
		 */
		toAbsolute()
		{
			if (!this.isRelative)
				return this;
			
			const via: string | null = (() =>
			{
				if (typeof process === "object")
					if (typeof process.cwd === "function")
						return process.cwd() || null;
				
				if (typeof window !== "undefined")
				{
					const lo = window.location;
					if (typeof lo !== "undefined")
						return lo.protocol + "//" + lo.hostname + lo.pathname;
				}
				
				return null;
			})();
			
			if (via === null)
				throw Exception.cannotMakeAbsolute();
			
			return Uri.tryParse(this, via);
		}
		
		/**
		 * @returns The path of types contained by this URI, 
		 * concatenated into a single string.
		 */
		toTypeString()
		{
			return this.types.map(t => t.toStringEncoded())
				.join(UriSyntax.componentSeparator);
		}
		
		/**
		 * @returns The path of stores contained by this URI, 
		 * concatenated into a single string.
		 */
		toStoreString(omitFile = false)
		{
			const thisAbsolute = Not.null(this.isRelative ? this.toAbsolute() : this);
			
			// In the case when the specified protocol is "file",
			// the string should start with a / so that we get
			// and output that looks like /Users/person/....
			const proto = thisAbsolute.protocol === UriProtocol.file ?
				"/" :
				thisAbsolute.protocol + "//";
			
			const isWeb = 
				thisAbsolute.protocol === UriProtocol.http || 
				thisAbsolute.protocol === UriProtocol.https;
			
			const components = thisAbsolute.stores
				.concat(omitFile ? [] : [new UriComponent(this.file)])
				.map((t, i) =>
				{
					return i === 0 && isWeb ?
						t.toStringHost() :
						t.toStringEncoded();
				})
				.join(UriSyntax.componentSeparator);
			
			return proto + components;
		}
		
		/**
		 * 
		 */
		toString()
		{
			let out = this.toStoreString();
			
			if (this.types.length > 0)
				out += UriSyntax.typeSeparator + this.toTypeString();
			
			return out;
		}
	}

	declare const window: any;
}
