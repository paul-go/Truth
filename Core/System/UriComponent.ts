import * as X from "../X";

const enum crcLength { value = 8 }
const crcRegex = new RegExp("[a-f0-9]{" + crcLength.value + "}", "i");

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
		this.crc = this.tryExtractCrc(raw);
		
		const rawVal = this.crc ?
			raw.replace(this.crc, "") : 
			raw;
		
		if (rawVal.length > 2)
			if (rawVal[0] === X.UriSyntax.indexerStart)
				if (rawVal[rawVal.length - 1] === X.UriSyntax.indexerEnd)
					if (/\d+/.test(rawVal.slice(1, -1)))
						this.index = +rawVal.slice(1, -1);
		
		this.value = this.index >= 0 ?
			this.index.toString() :
			unescape(rawVal);
		
		Object.freeze(this);
	}
	
	/** */
	private tryExtractCrc(text: string)
	{
		const delim = X.RegexSyntaxDelimiter.main;
		const delimEsc = escape(delim);
		const delimLen =
			text.startsWith(delim) ? delim.length :
			text.startsWith(delimEsc) ? delimEsc.length :
			-1;
		
		if (delimLen < 0 || text.length < delimLen + crcLength.value + 1)
			return "";
		
		const crcHex = text.substr(delimLen, crcLength.value);
		if (crcHex.length !== crcLength.value || !crcRegex.test(crcHex))
			return "";
		
		return crcHex;
	}
	
	/** Stores whether this component represents a pattern. */
	get isPattern() { return this.crc !== ""; }
	
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
	readonly value: string;
	
	/**
	 * Stores a pattern CRC, in the case when this UriComponent
	 * relates to a pattern. Stores an empty string in other cases.
	 */
	private readonly crc: string = "";
	
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
			const de = X.RegexSyntaxDelimiter.main;
			return de + this.crc + escape(this.value.slice(de.length));
		}
		
		if (this.index >= 0)
			return X.UriSyntax.indexerStart + this.index + X.UriSyntax.indexerEnd;
		
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
