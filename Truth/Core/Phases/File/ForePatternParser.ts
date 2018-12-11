import * as X from "../../X";


/**  */
export class ForePatternParser
{
	/**
	 * Parses the specified pattern string (without delimiters
	 * or flags), into an array of strings and infixes.
	 */
	static parse(content: string): ForePatternChunks
	{
		if (content.length === 0)
			return [];
		
		// There cannot be any infixes if the input 
		// content length is less than 3 characters.
		if (content.length < 3)
			return [content];
		
		const esc = X.Syntax.escapeChar;
		const spc = X.Syntax.space;
		const tab = X.Syntax.tab;
		const nfxStart = X.Syntax.infixStart;
		const nfxEnd = X.Syntax.infixEnd;
		let cursor = 0;
		
		const read = () =>
		{
			return cursor >= content.length ? "" : content[cursor++];
		}
		
		// Attempts to consume the specified token immediately 
		// following the cursor, and returns a boolean indicating
		// whether the consumption was successful.
		const at = (token: string) =>
		{
			if (content.slice(cursor, cursor + token.length) === token)
			{
				cursor += token.length;
				return true;
			}
			
			return false;
		}
		
		const skipWhitespace = () =>
		{
			while (cursor < content.length)
			{
				at(spc);
				at(tab);
				at(esc + spc);
				at(esc + tab);
			}
		}
		
		const parseExpression = () =>
		{
			const chunks: (Infix | string)[] = [];
			let chunk = "";
			
			const pushChunk = () =>
			{
				const chunkTrimmed = chunk.trim();
				if (chunkTrimmed.length)
					chunks.push(chunkTrimmed);
			}
			
			while (cursor < content.length)
			{
				// \<
				const escInfix = esc + nfxStart;
				if (at(escInfix))
					chunk += nfxStart;
				
				// \:
				const escJointSpc = esc + X.Syntax.joint;
				if (at(escJointSpc))
					chunk += X.Syntax.joint;
				
				// $ isn't escaped in Truth regexes, but is in JS
				if (at("$"))
					chunk += esc + "$";
				
				// ^ isn't escaped in Truth regexes, but is in JS
				if (at("^"))
					chunk += esc + "^";
				
				// <
				if (at(esc + nfxStart))
				{
					pushChunk();
					chunk = "";
					chunks.push(parseInfix());
				}
				else
				{
					chunk += read();
				}
			}
			
			pushChunk();
			return chunks;
		}
		
		const parseInfix = () =>
		{
			let term = "";
			let pastJoint = false;
			let forcesNominal = false;
			let requestsPattern = false;
			const lhsTerms: string[] = [];
			const rhsTerms: string[] = [];
			const terms = () => pastJoint ? rhsTerms : lhsTerms;
			
			skipWhitespace();
			
			if (at(X.Syntax.patternDelimiter))
				requestsPattern = true;
				
			else if (at(X.Syntax.infixStart))
				forcesNominal = true;
			
			const pushTerm = () =>
			{
				const termTrimmed = term.trim();
				if (termTrimmed.length)
					terms().push(termTrimmed);
				
				skipWhitespace();
			}
			
			while (cursor < content.length)
			{
				// \:\s
				const escJointSpc = esc + X.Syntax.joint + spc;
				if (at(escJointSpc))
					term += X.Syntax.joint + spc;
				
				// \:\t
				const escJointTab = esc + X.Syntax.joint + tab;
				if (at(escJointTab))
					term += escJointTab;
				
				if (!pastJoint)
					if (at(X.Syntax.joint))
						pastJoint = true;
				
				if (at(X.Syntax.combinator))
					pushTerm();
				
				if ((forcesNominal && at(nfxEnd + nfxEnd)))
					break;
				
				if (requestsPattern && at (X.Syntax.patternDelimiter + nfxEnd))
					break;
				
				if (at(nfxEnd))
					break;
				
				term += read();
			}
			
			pushTerm();
			return new Infix(lhsTerms, rhsTerms, forcesNominal, requestsPattern);
		}
		
		return parseExpression();
	}
	
	/** */
	private constructor() { }
}


/**
 * 
 */
export class Infix
{
	constructor(
		/** 
		 * Stores an array of strings that represent the
		 * terms located before the Joint operator.
		 */
		readonly lhsTerms: ReadonlyArray<string> = [],
		
		/**
		 * Stores an array of strings that represent the
		 * terms located after the Joint operator.
		 */
		readonly rhsTerms: ReadonlyArray<string> = [],
		
		/**
		 * Stores whether the <<Double>> angle bracket
		 * syntax was used to only match named types,
		 * rather than aliases.
		 */
		readonly forcesNominal: boolean = false,
		
		/**
		 * Stores whether the </Pattern/> syntax was
		 * used to embed an external pattern.
		 */
		readonly requestsPattern: boolean = false)
	{ }
	
	/** */
	get kind()
	{
		const lenL = this.lhsTerms.length;
		const lenR = this.rhsTerms.length;
		
		if (lenL > 0)
			return InfixKind.faulty;
		
		if (lenL + lenR === 0)
			return InfixKind.faulty;
		
		if (this.forcesNominal)
		{
			if (lenL === 0)
				return InfixKind.faulty;
			
			return InfixKind.population
		}
		
		if (this.requestsPattern)
		{
			if (lenR > 0)
				return InfixKind.faulty;
			
			return InfixKind.pattern;
		}
		
		if (lenL === 0)
			return InfixKind.portability;
		
		return InfixKind.population;
	}
}


/** */
export enum InfixKind
{
	faulty,
	pattern,
	portability,
	population
}


/** */
export type ForePatternChunks = (Infix | string)[];
