
namespace Truth
{
	/**
	 * This is a class that wraps the built-in URL object.
	 * It ensures that the system only every stores references
	 * to unique URLs, so that equality of two Uris can be tested
	 * by doing a simple referential comparison.
	 */
	export class KnownUri extends AbstractClass
	{
		/**
		 * Stores the well-known URI used by all volatile documents.
		 */
		static get volatile()
		{
			return this._volatile || (this._volatile = KnownUri.fromName(volatileName));
		}
		private static _volatile: KnownUri | null = null;
		
		/**
		 * Returns a KnownUri suitable for internal documents that are stored
		 * in memory, and not on disk. The URI that is returned follows the form:
		 * memory://memory/documentBaseNameHere.truth
		 * 
		 * @param documentBaseName The name of the truth document without
		 * and extension. If empty or omitted, a sequential numeric base name is
		 * generated.
		 */
		static fromName(documentBaseName?: string)
		{
			let uriText = 
				UriProtocol.memory + 
				"//memory/" + (documentBaseName || (++this.memUriCount).toString());
			
			if (!uriText.endsWith(Extension.truth))
				uriText += Extension.truth;
			
			return Misc.get(this.cache, uriText, () => new KnownUri(new URL(uriText)));
		}
		
		private static memUriCount = 0;
		
		/**
		 * Returns the KnownUri object associated with the text representation
		 * of the URI specified, or null in the case when the text value specified
		 * could not be parsed as a URI.
		 */
		static fromString(uriText: string, base?: KnownUri | string)
		{
			let mergedUrl: URL | null = null;
			
			try
			{
				const baseUrl =
					typeof base === "string" ? base :
					base instanceof KnownUri ? base.innerUrl :
					void 0;
				
				mergedUrl = new URL(uriText, baseUrl);
			}
			catch (e) {
				debugger;
			}
			
			if (mergedUrl === null)
				return null;
			
			const url = mergedUrl;
			return Misc.get(this.cache, mergedUrl.href, () => new KnownUri(url));
		}
		
		/**
		 * Stores a cache of all KnownUris created by the compiler, 
		 * keyed by a string representation of the KnownUri's inner URL.
		 */
		private static readonly cache = new Map<string, KnownUri>();
		
		/** */
		private constructor(private readonly innerUrl: URL)
		{
			super();
			// Generates an error if the URL isn't from a known protocol.
			this.protocol;
		}
		
		/** @internal */
		readonly class = Class.knownUri;
		
		/**
		 * Gets the protocol of the underlying URL.
		 */
		get protocol(): UriProtocol
		{
			return Not.null(UriProtocol.resolve(this.innerUrl.protocol));
		}
		
		/**
		 * Gets the kind of extension that was extracted from the URI path.
		 */
		get extension()
		{
			const path = this.innerUrl.pathname;
			
			if (path.endsWith(Extension.truth))
				return Extension.truth;
			
			if (path.endsWith(Extension.script))
				return Extension.script;
			
			return Extension.unknown;
		}
		
		/**
		 * Gets the file name specified in the URI, or an empty string in the
		 * case when no file name was specified.
		 */
		get fileName()
		{
			const path = this.innerUrl.pathname;
			const last = path.split("/").filter(s => !!s).reverse()[0] || "";
			return /\.[a-z]+$/i.test(last) ? last : "";
		}
		
		/**
		 * Returns a fully-qualified string representation of this KnownUri.
		 */
		toString()
		{
			return this.innerUrl.protocol === UriProtocol.file ?
				this.innerUrl.pathname :
				this.innerUrl.href;
		}
	}
	
	/** Document name used in volatile documents. */
	const volatileName = "V2hlcmUgd2UgZ28gb25lLCB3ZSBnbyBhbGwu";
}
