import * as X from "./X";


/**
 * 
 */
export class PatternTextTools
{
	/**
	 * Attempts to read a pattern from the specified start position
	 * in a text representation of a statement. If no pattern could
	 * be found, null is returned.
	 */
	static read(statementText: string, startAt: number)
	{
		const tokDtr = X.Syntax.patternDelimiter;
		if (statementText.substr(startAt, tokDtr.length) !== tokDtr)
			return null;
		
		let patternStart = startAt;
		let contentStart = startAt + tokDtr.length;
		let patternEnd = -1;
		let contentEnd = -1;
		let flags = PatternFlags.none;
		let cursor = startAt - 1;
		
		while (++cursor < statementText.length)
		{
			// Skip past escape sequences
			if (cursor > 0 && statementText[cursor- 1] === X.Syntax.escapeChar)
				continue;
			
			const char = statementText[cursor];
			
			// Quit if we find a joint while not in finalization
			if (char === X.Syntax.joint)
				break;
			
			// Enter into "possible finalization" mode
			// when a pattern delimiter is reached.
			if (char === X.Syntax.patternDelimiter)
			{
				const maybeContentEnd = cursor;
				
				if (cursor + 1 >= statementText.length || tryFinalize())
				{
					contentEnd = maybeContentEnd;
					break;
				}
				
				// False alarm. Rewind any pattern flags discovered.
				flags = PatternFlags.none;
			}
		}
		
		function tryFinalize()
		{
			while (++cursor < statementText.length)
			{
				const char = statementText[cursor];
				
				if (char === X.Syntax.space || char === X.Syntax.tab)
					continue;
				
				else if (char === X.Syntax.combinator)
					flags |= PatternFlags.coexistence;
				
				else if (char === X.Syntax.joint)
				{
					// Back up the cursor one space, 
					// so that pattern end calculations work.
					cursor--;
					return true;
				}
				
				return false;
			}
			
			return true;
		}
		
		if (contentEnd < 0)
			return null;
		
		return {
			patternStart,
			patternEnd: statementText.length - statementText.trimRight().length,
			contentStart,
			contentEnd,
			content: statementText.slice(contentStart, contentEnd),
			flags
		}
	}
	
	/**
	 * Creates a serialized representation of a pattern.
	 */
	static serialize(content: string, flags: PatternFlags, annotations: X.Subject[])
	{
		const annotationsText = annotations
			.map(an => an.toString())
			.join(X.Syntax.combinator);
		
		const valueNoCrc = 
			this.marker + 
			content + 
			(flags.toString()) + 
			annotationsText;
		
		return valueNoCrc + X.Crc.calculate(valueNoCrc);
	}
	
	/**
	 * 
	 */
	static serializePatternInfo(info: IPatternInfo, format?: X.PatternSerializationFormat)
	{
		switch (format || X.PatternSerializationFormat.literal)
		{
			case X.PatternSerializationFormat.content:
				return info.content;
			
			case X.PatternSerializationFormat.literal:
			{
				const delim = X.Syntax.patternDelimiter;
				const flags = info.flags;
				const flagsText = (flags | flags) === X.PatternFlags.coexistence ?
					X.Syntax.combinator :
					"";
				
				return delim + info.content + delim + flagsText;
			}
			
			case X.PatternSerializationFormat.system:
				return this.marker + 
					info.content + 
					info.flags.toString() + 
					info.annotationCrc;
		}
	}
	
	/**
	 * Parses a pattern from an internally serialized representation.
	 */
	static parse(serializedPattern: string)
	{
		if (!this.isSerializedPattern(serializedPattern))
			return null;
		
		return <IPatternInfo>{
			content: serializedPattern.slice(1, -(CrcLength + 1)),
			flags: parseInt(serializedPattern[serializedPattern.length - (CrcLength + 1)], 10),
			annotationCrc: serializedPattern.slice(-CrcLength)
		};
	}
	
	/** */
	static isSerializedPattern(text: string)
	{
		// The minimum number of bytes for a serialized
		// pattern is calculated by:
		//
		// 1 byte for the bell
		// 1 or more bytes for the regular expression content
		// 1 byte for the flags
		// (crcLength) bytes for the computed CRC of the associated annotations.
		
		return text.length >= (3 + CrcLength) && text[0] === this.marker;
	}
	
	/** 
	 * Stores the pattern marker, which is the ASCII bell character (0x7).
	 * This character, when placed at the first character position in a
	 * Subject, indicates that the subject stores a pattern.
	 */
	private static readonly marker = String.fromCharCode(7);
}


const CrcLength = 4;


/**
 * 
 */
export interface IPatternInfo
{
	readonly content: string;
	readonly flags: X.PatternFlags;
	readonly annotationCrc: string;
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
 * Identifies the various textual representations of a pattern.
 */
export const enum PatternSerializationFormat
{
	/** Refers to the inner content of the pattern. */
	content = 1,
	
	/** Refers to the pattern literal as it appears in the document. */
	literal = 2,
	
	/** Refers to the pattern literal's system serialization format. */
	system = 4
}
