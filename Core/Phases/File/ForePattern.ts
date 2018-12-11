import * as X from "../../X";


/**
 * A class that stores an unparsed Pattern,
 * contained directly by a Statement.
 */
export class ForePattern
{
	/**
	 * Parses a pattern from an internally serialized
	 * representation of it.
	 */
	static parse(serialized: string)
	{
		if (!this.canParse(serialized))
			return null;
		
		const innerContent = serialized.slice(1, -(CrcLength + 1));
		const flags = parseInt(serialized[serialized.length - (CrcLength + 1)], 10);
		const crc = serialized.slice(-CrcLength);
		
		return new ForePattern(innerContent, flags, crc);
	}
	
	/**
	 * Gets whether the specified internall serialized
	 * regular expression can be parsed through the
	 * static .parse() method on this class.
	 */
	static canParse(serialized: string)
	{
		return serialized.length >= (3 + CrcLength) && serialized[0] === Marker;
	}
	
	/**
	 * @internal
	 */
	constructor(
		innerContent: string,
		flags: PatternFlags,
		annotations: ReadonlyArray<X.Span> | string)
	{
		this.content = innerContent;
		const coex = PatternFlags.coexistence;
		this.hasCoexistenceFlag = (flags | coex) === coex;
		
		if (typeof annotations === "string")
		{
			this.crc = annotations;
		}
		else
		{
			const annotationsText = annotations
				.map(span => span.toString())
				.join(X.Syntax.combinator);
			
			const valueNoCrc = 
				Marker + 
				innerContent + 
				serializeFlags(this) +
				annotationsText;
			
			this.crc = valueNoCrc + X.Crc.calculate(valueNoCrc);
		}
		
		this.chunks = X.ForePatternParser.parse(innerContent);
		
		const literal = this.chunks.map(chunk =>
		{
			return typeof chunk === "string" ?
				chunk :
				".+"
		});
		
		this.innerRegExp = new RegExp("^" + literal.join("") + "$");
	}
	
	/** */
	readonly content: string;
	
	/** */
	readonly chunks: X.ForePatternChunks;
	
	/** */
	readonly crc: string;
	
	/**
	 * @internal
	 * Logical clock value used to make chronological 
	 * creation-time comparisons between PatternLiterals.
	 */
	readonly stamp = X.VersionStamp.next();
	
	/**
	 * Stores whether the pattern literal specifies the
	 * coexistence (trailing comma) flag, which allows 
	 * aliases to exist within the annotation set of
	 * other non-aliases.
	 */
	readonly hasCoexistenceFlag: boolean;
	
	/**
	 * Stores the inner regular expression of this pattern,
	 * in the case when a valid RegExp object could be
	 * created from the input passed to the constructor
	 * of this object. In the case when the input could not
	 * be converted into a usable RegExp object, the field
	 * stores null.
	 */
	private readonly innerRegExp: RegExp | null = null;
	
	/**
	 * @returns A boolean value that indicates whether 
	 * the specified input string matches the regular expression
	 * stored inside this pattern.
	 */
	test(input: string)
	{
		return this.innerRegExp ?
			this.innerRegExp.test(input) :
			false;
	}
	
	/** */
	toString(format = X.PatternSerializationFormat.system)
	{
		switch (format || X.PatternSerializationFormat.literal)
		{
			case X.PatternSerializationFormat.content:
				return this.content;
			
			case X.PatternSerializationFormat.literal:
			{
				const delim = X.Syntax.patternDelimiter;
				const flagsText = this.hasCoexistenceFlag ?
					X.Syntax.combinator :
					"";
				
				return delim + this.content + delim + flagsText;
			}
			
			case X.PatternSerializationFormat.system:
				return Marker + 
					this.content + 
					serializeFlags(this) + 
					this.crc;
		}
		
		return "";
	}
}


/**
 * Identifies the various textual representations of a pattern.
 */
export const enum PatternSerializationFormat
{
	/** Refers to the inner content of the pattern. */
	content = 1,
	
	/** Refers to the pattern literal as it appears in the document. */
	literal = 2,
	
	/**
	 * Refers to the pattern literal's system serialization format.
	 * The internal serialization format is as follows:
	 * 
	 * 1 byte for the bell (for easy identification)
	 * 1 or more bytes for the regular expression content
	 * 1 byte for the flags
	 * (crcLength) bytes for the computed CRC of the associated annotations.
	 */
	system = 4
}


/**
 * 
 */
export enum PatternFlags
{
	/** Indicates that no flags have been declared on the pattern. */
	none = 0,
	
	/** Indicates that the coexistence flag has been declared on the pattern. */
	coexistence = 1
}


/**
 * 
 */
function serializeFlags(p: ForePattern)
{
	return p.hasCoexistenceFlag ? X.Syntax.terminal : "";
}


/** 
 * Stores the pattern marker, which is the ASCII bell character (0x7).
 * This character, when placed at the first character position in a
 * Subject, indicates that the subject stores a pattern.
 */
const Marker = String.fromCharCode(7);


/**
 * Stores the length of the CRC value that is appended to the end
 * of all patterns when stored in memory. This CRC is calculated
 * using the annotations that were applied to the pattern, as well
 * as the pattern content itself. This is used to be able to distinguish
 * between two otherwise equal patterns that match two different
 * sets of types.
 */	
const CrcLength = 4;
