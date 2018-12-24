import * as X from "../../X";


/**
 * 
 */
export class Pattern
{
	/** @internal */
	constructor(
		/**
		 * 
		 */
		readonly units: ReadonlyArray<RegexUnit | X.Infix>,
		/**
		 * Stores whether the pattern is considered to be "Total"
		 * or "Partial". Total patterns must match an entire annotation
		 * set (the entire strip of content to the right of a joint, after
		 * being trimmed). Partial patterns match individually 
		 * specified subjects (separated by commas).
		 */
		readonly isTotal: boolean,
		/**
		 * Stores a CRC which is computed from the set of
		 * annotations specified to the right of the pattern.
		 */
		readonly crc: string)
	{ }
	
	/** */
	test(input: string)
	{
		return !!input;
	}
	
	/** */
	toString()
	{
		return "";
	}
}


/**
 * Ambient unifier for all PatternUnit instances
 */
export abstract class RegexUnit
{
	constructor(readonly quantifier: RegexQuantifier | null) { }
}


/**
 * 
 */
export class RegexSet extends RegexUnit
{
	/**
	 * Creates a RegexSet instance from the specified
	 * pre-defined regular expression character set.
	 */
	static fromKnown(
		knownSet: X.RegexSyntaxKnownSet,
		quantifier: RegexQuantifier | null = null)
	{
		const alphabetBuilder = new X.AlphabetBuilder();
		const set = X.RegexSyntaxKnownSet;
		const gt = (char: string) => char.charCodeAt(0) + 1;
		const lt = (char: string) => char.charCodeAt(0) - 1;
		
		switch (knownSet)
		{
			case set.digit:
				alphabetBuilder.add("0", "9");
				break;
			
			case set.digitNon:
				alphabetBuilder.add(0, lt("0"));
				alphabetBuilder.add(gt("9"), X.UnicodeMax);
				break;
			
			case set.alphanumeric:
				alphabetBuilder.add("0", "9");
				alphabetBuilder.add("A", "Z");
				alphabetBuilder.add("a", "z");
				break;
			
			case set.alphanumericNon:
				alphabetBuilder.add(0, lt("0"));
				alphabetBuilder.add(gt("9"), lt("A"));
				alphabetBuilder.add(gt("Z"), lt("a"));
				alphabetBuilder.add(gt("z"), X.UnicodeMax);
				break;
			
			case set.whitespace:
				alphabetBuilder.add(9, 13);
				alphabetBuilder.add(160);
				alphabetBuilder.add(5760);
				alphabetBuilder.add(8192, 8202);
				alphabetBuilder.add(8232);
				alphabetBuilder.add(8233);
				alphabetBuilder.add(8239);
				alphabetBuilder.add(8287);
				alphabetBuilder.add(12288);
				alphabetBuilder.add(65279);
				break;
			
			case set.whitespaceNon:
				alphabetBuilder.add(0, 8);
				alphabetBuilder.add(14, 159);
				alphabetBuilder.add(161, 5759);
				alphabetBuilder.add(5761, 8191);
				alphabetBuilder.add(8203, 8231);
				alphabetBuilder.add(8232);
				alphabetBuilder.add(8233);
				alphabetBuilder.add(8234, 8238);
				alphabetBuilder.add(8240, 8286);
				alphabetBuilder.add(8288, 12287);
				alphabetBuilder.add(12289, 65278);
				alphabetBuilder.add(65280, X.UnicodeMax);
				break;
			
			case set.wild:
				alphabetBuilder.addWild();
				break;
		}
		
		return new RegexSet(
			alphabetBuilder.toAlphabet(), 
			quantifier);
	}
	
	/** */
	constructor(
		readonly alphabet: X.Alphabet,
		readonly quantifier: RegexQuantifier | null)
	{
		super(quantifier);
	}
}


/**
 * 
 */
export class RegexGroup extends RegexUnit
{
	constructor(
		/**
		 * 
		 */
		readonly cases: ReadonlyArray<ReadonlyArray<RegexUnit>>,
		readonly quantifier: RegexQuantifier | null)
	{
		super(quantifier);
	}
}


/**
 * A pattern "grapheme" is a pattern unit class that
 * represents:
 * 
 * a) A "Literal", which is a single unicode-aware character,
 * with possible representations being an ascii character,
 * a unicode character, or an ascii or unicode escape
 * sequence.
 * 
 * or b) A "Special", which is a sequence that matches
 * something other than the character specified,
 * such as . \b \s
 */
export class RegexGrapheme extends RegexUnit
{
	constructor(
		readonly grapheme: string,
		readonly quantifier: RegexQuantifier | null)
	{
		super(quantifier);
	}
}


/**
 * A Regex "Sign" refers to an escape sequence that refers
 * to one other character, as opposed to that character
 * being written directly in the parse stream.
 */
export class RegexSign extends RegexUnit
{
	constructor(
		readonly sign: X.RegexSyntaxSign,
		readonly quantifier: RegexQuantifier | null)
	{
		super(quantifier);
	}
}


/**
 * A pattern unit class that represents +, *, 
 * and explicit quantifiers such as {1,2}.
 */
export class RegexQuantifier
{
	constructor(
		/**
		 * Stores the lower bound of the quantifier, 
		 * or the fewest number of graphemes to be matched.
		 */
		readonly lower: number = 0,
		/**
		 * Stores the upper bound of the quantifier, 
		 * or the most number of graphemes to be matched.
		 */
		readonly upper: number = Infinity,
		/**
		 * Stores whether the the quantifier is restrained,
		 * in that it matches the fewest possible number
		 * of characters.
		 * 
		 * (Some regular expression flavours awkwardly
		 * refer to this as "non-greedy".)
		 */
		readonly restrained: boolean)
	{ }
}
