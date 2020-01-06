
namespace Truth
{
	const hashRegex = new RegExp("[a-f0-9]{" + Hash.length + "}", "i");
	
	/**
	 * A class that represents a single component of a Uri.
	 * Handled encoding and decoding of the underlying value.
	 */
	export class UriComponent
	{
		/** */
		constructor(raw: string)
		{
			this.isRetract = raw === "..";
			this.isCurrent = raw === ".";
			this.hash = this.tryExtractHash(raw);
			
			if (raw.length > 2)
				if (raw[0] === UriSyntax.indexerStart)
					if (raw[raw.length - 1] === UriSyntax.indexerEnd)
						if (/\d+/.test(raw.slice(1, -1)))
							this.index = +raw.slice(1, -1);
			
			this.value = this.index >= 0 ?
				this.index.toString() :
				unescape(raw);
			
			Object.freeze(this);
		}
		
		/** */
		private tryExtractHash(text: string)
		{
			const delim = RegexSyntaxDelimiter.main;
			const delimEsc = escape(delim);
			const delimLen =
				text.startsWith(delim) ? delim.length :
				text.startsWith(delimEsc) ? delimEsc.length :
				-1;
			
			const hashLen = Hash.length;
			
			if (delimLen < 0 || text.length < delimLen + hashLen + 1)
				return "";
			
			const hash = text.substr(delimLen, hashLen);
			if (hash.length !== hashLen || !hashRegex.test(hash))
				return "";
			
			return hash;
		}
		
		/** Stores whether this component represents a pattern. */
		get isPattern() { return this.hash !== ""; }
		
		/** Stores whether this component is the retraction indicator (..) */
		readonly isRetract: boolean;
		
		/** Stores whether this component is the current indicator (.) */
		readonly isCurrent: boolean;
		
		/**
		 * Stores a number that indicates a type index that this UriComponent, 
		 * refers to, used in the case when this UriComponent is referring to
		 * an anonymous type.
		 * 
		 * Stores -1 in the case when an index value is not relevant to this
		 * UriComponent instance.
		 */
		readonly index: number = -1;
		
		/**
		 * Stores the decoded text value of this UriComponent.
		 * Stores a string version of the .index property in the case when
		 * it is greater than -1.
		 * This has the same value as the result of the .toString() method.
		 */
		readonly value: string = "";
		
		/**
		 * Stores a pattern hash, in the case when this UriComponent
		 * relates to a pattern. Stores an empty string in other cases.
		 */
		private readonly hash: string = "";
		
		/**
		 * @returns The raw decoded text value of this UriComponent.
		 */
		toString()
		{
			return this.value;
		}
		
		/**
		 * @returns The URL encoded text value of this UriComponent.
		 */
		toStringEncoded()
		{
			if (this.isPattern)
			{
				const de = RegexSyntaxDelimiter.main;
				return de + escape(this.value.slice(de.length));
			}
			
			if (this.index >= 0)
				return UriSyntax.indexerStart + this.index + UriSyntax.indexerEnd;
			
			return escape(this.value);
		}
		
		/**
		 * @returns The text value of this UriComponent, using an
		 * encoding that is compatible with an RFC 3986 host name.
		 */
		toStringHost()
		{
			return new URL("http://" + this.value).host;
		}
	}
	
	declare const URL: typeof import("url").URL;
}
