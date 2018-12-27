import * as X from "../../X";


/** */
export class PatternPrecompiler
{
	/**
	 * Compiles the specified pattern into a JS-native
	 * RegExp object that can be used to execute regular
	 * expression pre-matching (i.e. checks that essentially
	 * ignore any infixes that the pattern may have).
	 */
	static exec(pattern: X.Pattern)
	{
		const result: string[] = [];
		
		for (const unit of pattern.units)
		{
			if (unit instanceof X.RegexGrapheme)
			{
				unit.grapheme === "$" || unit.grapheme === "^" ?
					result.push(X.Syntax.escapeChar + unit.grapheme) :
					result.push(unit.grapheme);
				
				if (unit.quantifier)
					result.push(unit.quantifier.toString());
			}
			else if (unit instanceof X.Infix)
			{
				result.push(ExpedientInfixPattern);
			}
			else
			{
				result.push(unit.toString());
			}
		}
		
		result.unshift("^");
		result.push("$");
		
		return new RegExp(result.join(""), "u");
	}
}


/**
 * Stores the pattern that is fed into a pattern in
 * place of where infixes are, in order to be able to
 * do early tests on the regular expression without
 * doing a full resolution of the types that the infixes
 * reference. The pattern essentially means:
 * 
 * "Match one non-whitespace character, or a series
 * of characters, provided that the string of characters
 * don't begin or end with whitespace."
 */
const ExpedientInfixPattern = "\\S+(\\s+\\S+)*";
