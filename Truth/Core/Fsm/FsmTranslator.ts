import * as X from "../X";


/**
 * @internal
 * Translates Pattern instances into a corresponding Fsm.
 */
export class FsmTranslator
{
	/** */
	static exec(units: Iterable<X.RegexUnit>)
	{
		for (const unit of units)
		{
			if (unit instanceof X.RegexSet)
			{
				throw X.Exception.notImplemented();
			}
			else if (unit instanceof X.RegexGroup)
			{
				throw X.Exception.notImplemented();
			}
			else if (unit instanceof X.RegexGrapheme)
			{
				throw X.Exception.notImplemented();
			}
			else if (unit instanceof X.RegexSign)
			{
				throw X.Exception.notImplemented();
			}
			else throw X.Exception.unknownState();
		}
		
		return <X.Fsm>null!;
	}
	
	/** */
	private static translateSet(
		set: X.RegexSet,
		alpha: X.AlphabetBuilder | null = null)
	{
		
	}
	
	/** */
	private static translateGroup(
		group: X.RegexGroup,
		alpha: X.AlphabetBuilder | null = null)
	{
		const builder = alpha || new X.AlphabetBuilder().addWild();
	}
	
	/** */
	private static createGroupAlphabet(group: X.RegexGroup)
	{
		const builder = new X.AlphabetBuilder();
		builder.addWild();
		
		for (const element of group.cases)
		{
			throw X.Exception.notImplemented();
		}
	}
	
	/** */
	private static translateGrapheme(
		grapheme: X.RegexGrapheme,
		alpha: X.AlphabetBuilder | null = null)
	{
		
	}
	
	/** */
	private static translateSign(
		sign: X.RegexSign,
		alpha: X.AlphabetBuilder | null = null)
	{
		
	}
}
