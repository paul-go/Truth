import * as X from "./X";


/**
 * A class that performs basic pattern literal parsing.
 * (Full regular expression parsing happens later in the pipeline).
 */
export class PatternLiteralParser
{
	/**
	 * Attempts to parse a PatternLiteral from the
	 * specified text, starting at the specified offset.
	 */
	static invoke(text: string, offset: number): PatternLiteralParseResult
	{
		let jointPosition = -1;
		let offsetStart = offset;
		let offsetEnd = -1;
		let hasCoexistenceFlag = false;
		let cursor = offset - 1;
		
		while (++cursor < text.length)
		{
			// Skip past escape sequences
			if (cursor > 0 && text[cursor- 1] === X.Syntax.escapeChar)
				continue;
			
			const char = text[cursor];
			
			// Quit if we find a joint while not in finalization
			if (char === X.Syntax.joint)
				break;
			
			// Enter into "possible finalization" mode when
			// a pattern delimiter is reached.
			if (char === X.Syntax.patternDelimiter)
				if (tryFinalize())
					break;
		}
		
		function tryFinalize()
		{
			while (++cursor < text.length)
			{
				const char = text[cursor];
				
				if (char === X.Syntax.space || char === X.Syntax.tab)
					continue;
				
				else if (char === X.Syntax.combinator)
					hasCoexistenceFlag = true;
				
				else if (char === X.Syntax.joint)
					return true;
				
				return false;
			}
			
			return false;
		}
		
		return {
			jointPosition,
			offsetStart,
			offsetEnd,
			hasCoexistenceFlag,
			value: text.slice(offsetStart, offsetEnd)
		}
	}
}


/**
 * Stores the values that are returned as a result of parsing
 * a pattern literal, whether the parse succeeded or failed.
 */
export interface PatternLiteralParseResult
{
	/**
	 * Stores the position of the joint, in the case when the
	 * pattern was successfully parsed. If the pattern was not
	 * successfully parsed, this value is -1.
	 */
	readonly jointPosition: number;
	
	/** */
	readonly offsetStart: number;
	
	/** */
	readonly offsetEnd: number;
	
	/** */
	readonly hasCoexistenceFlag: boolean;
	
	/** */
	readonly value: string;
}
