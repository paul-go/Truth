
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
		 * @internal
		 * Returns a KnownUri suitable for internal documents that aren't actually
		 * stored anywhere other than in memory. The number provided ends up
		 * as the fictitious name of the truth file specified in the URI.
		 */
		static createMemoryUri(number: number)
		{
			const uriText = UriProtocol.memory + "//memory/" + number + ".truth";
			return Misc.get(this.cache, uriText, () => new KnownUri(new URL(uriText)));
		}
		
		/**
		 * Returns the KnownUri object associated with the text representation
		 * of the URI specified, or null in the case when the text value specified
		 * could not be parsed as a URI.
		 */
		static fromString(uriText: string, base?: KnownUri)
		{
			let mergedUrl: URL | null = null;
			
			try
			{
				mergedUrl = new URL(uriText, base ? base.innerUrl : void 0);
			}
			catch (e) { }
			
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
		 * Returns a fully-qualified string representation of this KnownUri.
		 */
		toString()
		{
			return this.innerUrl.protocol === UriProtocol.file ?
				this.innerUrl.pathname :
				this.innerUrl.href;
		}
	}
}
