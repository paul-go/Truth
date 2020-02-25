
namespace Truth
{
	/** */
	export class PatternPrecompiler
	{
		/**
		 * Compiles the specified pattern into a JS-native
		 * RegExp object that can be used to execute regular
		 * expression pre-matching (i.e. checks that essentially
		 * ignore any infixes that the pattern may have).
		 */
		static exec(pattern: Pattern)
		{
			const result: string[] = [];
			
			for (const unit of pattern.units)
			{
				if (unit instanceof RegexGrapheme)
				{
					if (mustEscapeChars.includes(unit.grapheme))
						result.push(Syntax.escapeChar + unit.grapheme);
					else
						result.push(unit.grapheme);
					
					if (unit.quantifier)
						result.push(unit.quantifier.toString());
				}
				else if (unit instanceof Infix)
				{
					result.push(expedientInfixPattern);
				}
				else
				{
					result.push(unit.toString());
				}
			}
			
			result.unshift("^");
			result.push("$");
			
			const regText = result.join("");
			
			try
			{
				return new RegExp(regText, "u");
			}
			catch (e)
			{
				return null;
			}
		}
	}
	
	/**
	 * Stores the list of characters that must be escaped
	 * in order for the Truth regular expression flavor to
	 * be compatible with the engine build into JavaScript.
	 */
	const mustEscapeChars = ["$", "^", "{", "}"];
	
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
	const expedientInfixPattern = "(\\S+(\\s+\\S+)*)";
}
