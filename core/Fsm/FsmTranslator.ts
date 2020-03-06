
namespace Truth
{
	/**
	 * @internal
	 * Translates Pattern instances into a corresponding Fsm.
	 */
	export class FsmTranslator
	{
		/** */
		static exec(units: Iterable<RegexUnit>)
		{
			for (const unit of units)
			{
				if (unit instanceof RegexSet)
				{
					throw Exception.notImplemented();
				}
				else if (unit instanceof RegexGroup)
				{
					throw Exception.notImplemented();
				}
				else if (unit instanceof RegexGrapheme)
				{
					throw Exception.notImplemented();
				}
				else if (unit instanceof RegexSign)
				{
					throw Exception.notImplemented();
				}
				else throw Exception.unknownState();
			}
			
			return null! as Fsm;
		}
		
		/** */
		private static translateSet(
			set: RegexSet,
			alpha: AlphabetBuilder | null = null)
		{
			
		}
		
		/** */
		private static translateGroup(
			group: RegexGroup,
			alpha: AlphabetBuilder | null = null)
		{
			const builder = alpha || new AlphabetBuilder().addWild();
		}
		
		/** */
		private static createGroupAlphabet(group: RegexGroup)
		{
			const builder = new AlphabetBuilder();
			builder.addWild();
			
			for (const element of group.cases)
			{
				throw Exception.notImplemented();
			}
		}
		
		/** */
		private static translateGrapheme(
			grapheme: RegexGrapheme,
			alpha: AlphabetBuilder | null = null)
		{
			
		}
		
		/** */
		private static translateSign(
			sign: RegexSign,
			alpha: AlphabetBuilder | null = null)
		{
			
		}
	}
}
