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
		if (this.compiledRegExp === null)
			this.compiledRegExp = X.PatternPrecompiler.exec(this);
		
		const inputTrimmed = input.trim();
		if (inputTrimmed === "")
			return false;
		
		return this.compiledRegExp.test(input);
	}
	
	private compiledRegExp: RegExp | null = null;
	
	/**
	 * Converts this Pattern to a string representation.
	 * (Note that the serialized pattern cannot be used
	 * as a parameter to a JavaScript RegExp object.)
	 */
	toString()
	{
		const delim = X.RegexSyntaxDelimiter.main.toString();
		
		return (
			delim + 
			this.units.map(u => u.toString()).join("") + 
			this.isTotal ? delim : ""
		);
	}
}


/**
 * Ambient unifier for all PatternUnit instances
 */
export abstract class RegexUnit
{
	constructor(readonly quantifier: RegexQuantifier | null) { }
	
	/** */
	abstract toString(): string;
}


/**
 * 
 */
export class RegexSet extends RegexUnit
{
	/** */
	constructor(
		readonly knowns: ReadonlyArray<X.RegexSyntaxKnownSet>,
		readonly ranges: ReadonlyArray<RegexCharRange>,
		readonly singles: ReadonlyArray<string | X.RegexSyntaxSign>,
		readonly isNegated: boolean,
		readonly quantifier: RegexQuantifier | null)
	{
		super(quantifier);
	}
	
	/** */
	toString()
	{
		const kLen = this.knowns.length;
		const rLen = this.ranges.length;
		const cLen = this.singles.length;
		
		const setText = (() =>
		{
			if (kLen === 1 && rLen + cLen === 0)
				return this.knowns[0].toString();
			
			if (cLen === 1 && kLen + cLen === 0)
				return this.singles[0];
			
			return [
				X.RegexSyntaxDelimiter.setStart,
				...this.knowns,
				...this.ranges.map(r => String.fromCodePoint(r.from) + "-" + String.fromCodePoint(r.to)),
				...this.singles,
				X.RegexSyntaxDelimiter.setEnd
			].join("");
		})();
		
		return setText + (this.quantifier ? this.quantifier.toString() : "");
	}
	
	/** */
	toAlphabet()
	{
		const alphabetBuilder = new X.AlphabetBuilder();
		const gt = (char: string) => char.charCodeAt(0) + 1;
		const lt = (char: string) => char.charCodeAt(0) - 1;
		
		for (const known of this.knowns)
		{
			switch (known)
			{
				case X.RegexSyntaxKnownSet.digit:
					alphabetBuilder.add("0", "9");
					break;
				
				case X.RegexSyntaxKnownSet.digitNon:
					alphabetBuilder.add(0, lt("0"));
					alphabetBuilder.add(gt("9"), X.UnicodeMax);
					break;
				
				case X.RegexSyntaxKnownSet.alphanumeric:
					alphabetBuilder.add("0", "9");
					alphabetBuilder.add("A", "Z");
					alphabetBuilder.add("a", "z");
					break;
				
				case X.RegexSyntaxKnownSet.alphanumericNon:
					alphabetBuilder.add(0, lt("0"));
					alphabetBuilder.add(gt("9"), lt("A"));
					alphabetBuilder.add(gt("Z"), lt("a"));
					alphabetBuilder.add(gt("z"), X.UnicodeMax);
					break;
				
				case X.RegexSyntaxKnownSet.whitespace:
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
				
				case X.RegexSyntaxKnownSet.whitespaceNon:
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
				
				case X.RegexSyntaxKnownSet.wild:
					alphabetBuilder.addWild();
					break;
			}
		}
		
		for (const range of this.ranges)
			alphabetBuilder.add(range.from, range.to);
		
		for (const single of this.singles)
			alphabetBuilder.add(single);
		
		return alphabetBuilder.toAlphabet(this.isNegated);
	}
}


/**
 * 
 */
export class RegexCharRange
{
	constructor(
		readonly from: number,
		readonly to: number)
	{ }
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
	
	/** */
	toString()
	{
		if (this.cases.length === 0)
			return "";
		
		const cases = this.cases.map(ca => ca.map(unit => unit.toString()));
		const group = 
			X.RegexSyntaxDelimiter.groupStart +
			cases.join(X.RegexSyntaxDelimiter.alternator) +
			X.RegexSyntaxDelimiter.groupEnd;
		
		return group + (this.quantifier ? this.quantifier.toString() : "");
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
	
	/** */
	toString()
	{
		const q = this.quantifier;
		return this.grapheme.toString() + (q === null ? "" : q.toString());
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
	
	/** */
	toString()
	{
		const q = this.quantifier;
		return this.sign.toString() + (q === null ? "" : q.toString());
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
	
	/**
	 * Converts the regex quantifier to an optimized string.
	 */
	toString()
	{
		const rst = this.restrained ? X.RegexSyntaxMisc.restrained : "";
		const lo = this.lower;
		const up = this.upper;
		
		if (lo === 0 && up === Infinity)
			return X.RegexSyntaxMisc.star + rst;
		
		if (lo === 1 && up === Infinity)
			return X.RegexSyntaxMisc.plus + rst;
		
		const qs = X.RegexSyntaxDelimiter.quantifierStart;
		const qp = X.RegexSyntaxDelimiter.quantifierSeparator;
		const qe = X.RegexSyntaxDelimiter.quantifierEnd;
		
		return lo === up ?
			qs + lo + qe :
			qs + lo + qp + (up === Infinity ? "" : up.toString()) + qe;
	}
}
