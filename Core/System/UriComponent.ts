import * as X from "../X";


/**
 * A class that represents a single component of a Uri.
 * Handled encoding and decoding of the underlying value.
 */
export class UriComponent
{
	/** */
	constructor(raw: string)
	{
		const delim = X.RegexSyntaxDelimiter.main;
		
		this.isRetract = raw === "..";
		this.isCurrent = raw === ".";
		this.isPattern = 
			raw.startsWith(delim) ||
			raw.startsWith(encodeURIComponent(delim));
		
		if (raw.length > 2)
			if (raw[0] === X.UriSyntax.indexorStart)
				if (raw[raw.length - 1] === X.UriSyntax.indexorEnd)
					if (/\d+/.test(raw.slice(1, -1)))
						this.index = +raw.slice(1, -1);
		
		this.value = this.index >= 0 ?
			this.index.toString() :
			decodeURIComponent(raw);
		
		Object.freeze(this);
	}
	
	/** Stores whether this component is the retraction indicator (..) */
	readonly isRetract: boolean;
	
	/** Stores whether this component is the current indicator (.) */
	readonly isCurrent: boolean;
	
	/** Stores whether this component represents a pattern. */
	readonly isPattern: boolean;
	
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
	 * @returns The decoded text value of this UriComponent.
	 */
	toString()
	{
		return this.value;
	}
	
	/**
	 * 
	 */
	toStringEncoded()
	{
		if (this.isPattern)
		{
			const de = X.RegexSyntaxDelimiter.main
			return de + encodeURIComponent(this.value.slice(de.length));
		}
		
		if (this.index >= 0)
			return X.UriSyntax.indexorStart + this.index + X.UriSyntax.indexorEnd;
		
		return encodeURIComponent(this.value);
	}
}
