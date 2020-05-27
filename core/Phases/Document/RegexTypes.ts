
namespace Truth
{
	/**
	 * Base class for all PatternUnit instances.
	 */
	export abstract class RegexUnit
	{
		constructor(readonly quantifier: RegexQuantifier | null) { }
		
		/** */
		abstract toString(): string;
	}
	
	/**
	 * A class that describes Regular Expression character
	 * sets.
	 */
	export class RegexSet extends RegexUnit
	{
		/** */
		constructor(
			readonly knowns: readonly RegexSyntaxKnownSet[],
			readonly ranges: readonly RegexCharRange[],
			readonly unicodeBlocks: readonly string[],
			readonly singles: readonly string[],
			readonly isNegated: boolean,
			readonly quantifier: RegexQuantifier | null)
		{
			super(quantifier);
		}
		
		/**
		 * Returns whether the specified character code is included
		 * in this RegexSet.
		 * 
		 * Note that if the character specified is a unicode character,
		 * the method will currently always return false.
		 */
		includes(char: string)
		{
			if (this.isNegated)
				return false;
			
			if (this.knowns.includes(RegexSyntaxKnownSet.wild))
				return true;
			
			if (this.singles.includes(char))
				return true;
			
			const charCode = char.codePointAt(0);
			if (charCode === undefined || charCode > 255)
				return false;
			
			for (const range of this.ranges)
				if (charCode >= range.from  && charCode <= range.to)
					return true;
			
			if (this.knowns.length > 0)
			{
				const applicableSet = RegexSyntaxKnownSet.of(char);
				if (applicableSet !== null)
					if (this.knowns.includes(applicableSet))
						return true;
			}
			
			return false;
		}
		
		/** */
		toString()
		{
			const kLen = this.knowns.length;
			const rLen = this.ranges.length;
			const uLen = this.unicodeBlocks.length;
			const cLen = this.singles.length;
			
			const setText = (() =>
			{
				if (kLen === 1 && rLen + uLen + cLen === 0)
					return this.knowns[0].toString();
				
				if (uLen === 1 && kLen + rLen + cLen === 0)
					return [
						RegexSyntaxDelimiter.setStart + 
						serializeUnicodeBlock(this.unicodeBlocks[0]) +
						RegexSyntaxDelimiter.setEnd
					].join("");
				
				if (cLen === 1 && kLen + rLen + uLen === 0)
					return this.singles[0];
				
				return [
					RegexSyntaxDelimiter.setStart,
					...this.knowns,
					...this.ranges.map(r => esc(r.from) + "-" + esc(r.to)),
					...this.unicodeBlocks.map(serializeUnicodeBlock),
					...escMany(this.singles),
					RegexSyntaxDelimiter.setEnd
				].join("");
			})();
			
			return setText + (this.quantifier ? this.quantifier.toString() : "");
		}
		
		/**
		 * @internal
		 */
		toAlphabet()
		{
			const alphabetBuilder = new AlphabetBuilder();
			const gt = (char: string) => char.charCodeAt(0) + 1;
			const lt = (char: string) => char.charCodeAt(0) - 1;
			
			for (const known of this.knowns)
			{
				switch (known)
				{
					case RegexSyntaxKnownSet.digit:
						alphabetBuilder.add("0", "9");
						break;
					
					case RegexSyntaxKnownSet.digitNon:
						alphabetBuilder.add(0, lt("0"));
						alphabetBuilder.add(gt("9"), UnicodeMax);
						break;
					
					case RegexSyntaxKnownSet.alphanumeric:
						alphabetBuilder.add("0", "9");
						alphabetBuilder.add("A", "Z");
						alphabetBuilder.add("a", "z");
						break;
					
					case RegexSyntaxKnownSet.alphanumericNon:
						alphabetBuilder.add(0, lt("0"));
						alphabetBuilder.add(gt("9"), lt("A"));
						alphabetBuilder.add(gt("Z"), lt("a"));
						alphabetBuilder.add(gt("z"), UnicodeMax);
						break;
					
					case RegexSyntaxKnownSet.whitespace:
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
					
					case RegexSyntaxKnownSet.whitespaceNon:
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
						alphabetBuilder.add(65280, UnicodeMax);
						break;
					
					case RegexSyntaxKnownSet.wild:
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
			readonly cases: readonly (readonly RegexUnit[])[],
			readonly quantifier: RegexQuantifier | null)
		{
			super(quantifier);
		}
		
		/** */
		toString()
		{
			if (this.cases.length === 0)
				return "";
			
			const start = RegexSyntaxDelimiter.groupStart;
			const mid = this.cases
				.map(ca => ca.map(unit => esc(unit.toString())).join(""))
				.join(RegexSyntaxDelimiter.alternator);
			
			const end = RegexSyntaxDelimiter.groupEnd;
			const quant = this.quantifier ? this.quantifier.toString() : "";
			
			return start + mid + end + quant;
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
			const qEsc = q === null ? "" : esc(q.toString());
			const g = this.grapheme.toString();
			
			return escapableGraphemes.includes(g) ?
				"\\" + g + qEsc :
				g + qEsc;
		}
	}
	
	/** */
	const escapableGraphemes: string[] = [
		RegexSyntaxMisc.star,
		RegexSyntaxMisc.plus,
		RegexSyntaxMisc.negate,
		RegexSyntaxMisc.restrained,
		RegexSyntaxDelimiter.groupStart,
		RegexSyntaxDelimiter.groupEnd,
		RegexSyntaxDelimiter.alternator,
		RegexSyntaxDelimiter.setStart,
		RegexSyntaxDelimiter.setEnd,
		RegexSyntaxDelimiter.quantifierStart,
		RegexSyntaxDelimiter.quantifierEnd
	];
	
	/**
	 * A Regex "Sign" refers to an escape sequence that refers
	 * to one other character, as opposed to that character
	 * being written directly in the parse stream.
	 */
	export class RegexSign extends RegexUnit
	{
		constructor(
			readonly sign: RegexSyntaxSign,
			readonly quantifier: RegexQuantifier | null)
		{
			super(quantifier);
		}
		
		/** */
		toString()
		{
			const q = this.quantifier;
			return this.sign.toString() + (q === null ? "" : esc(q.toString()));
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
			readonly min: number = 0,
			/**
			 * Stores the upper bound of the quantifier, 
			 * or the most number of graphemes to be matched.
			 */
			readonly max: number = Infinity,
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
			const rst = this.restrained ? RegexSyntaxMisc.restrained : "";
			
			if (this.min === 0 && this.max === Infinity)
				return RegexSyntaxMisc.star + rst;
			
			if (this.min === 1 && this.max === Infinity)
				return RegexSyntaxMisc.plus + rst;
			
			if (this.min === 0 && this.max === 1)
				return RegexSyntaxMisc.restrained;
			
			const qs = RegexSyntaxDelimiter.quantifierStart;
			const qp = RegexSyntaxDelimiter.quantifierSeparator;
			const qe = RegexSyntaxDelimiter.quantifierEnd;
			
			return this.min === this.max ?
				qs + this.min + qe :
				qs + this.min + qp + (this.max === Infinity ? "" : this.max.toString()) + qe;
		}
	}
	
	/**
	 * Utility function that returns a double escape
	 * if the passed value is a backslash.
	 */
	function esc(maybeBackslash: string | number)
	{
		if (maybeBackslash === 92 || maybeBackslash === "\\")
			return "\\\\";
		
		if (typeof maybeBackslash === "number")
			return String.fromCodePoint(maybeBackslash);
		
		return maybeBackslash;
	}
	
	/**
	 * 
	 */
	function escMany(array: readonly (string | number)[])
	{
		return array.map(esc).join("");
	}
	
	/**
	 * 
	 */
	function serializeUnicodeBlock(blockName: string)
	{
		const block = UnicodeBlocks.get(blockName.toLowerCase()); 
		if (block === undefined)
			throw Exception.unknownState();
		
		const rng = RegexSyntaxDelimiter.range;
		const from = block[0].toString(16);
		const to = block[1].toString(16);
		return `\\u{${from}}${rng}\\u{${to}}`;
	}
}
