import * as X from "../../X";


/** */
export type Subject = X.Identifier | X.Pattern | X.Uri | X.Anon;


/** */
export class SubjectParser
{
	/** */
	static invoke(text: string): Subject
	{
		if (text.trim().length === 0)
			throw X.Exception.invalidArgument();
		
		//if (X.ForePattern.canParse(text))
		//	return X.ForePattern.parse(text)!;
		
		return new X.Identifier(text);
	}
	
	private constructor() { }
}


/** */
export class SubjectSerializer
{
	/** */
	static invoke(subject: Subject, escapeStyle: X.IdentifierEscapeKind)
	{
		if (subject instanceof X.Identifier)
			return subject.toString(escapeStyle);
		
		else if (subject instanceof X.Pattern)
			return subject.toString();
		
		else if (subject instanceof X.Uri)
			return subject.toString(true, true);
		
		else if (subject instanceof X.Anon)
			return subject.toString();
		
		throw X.Exception.unknownState();
	}
}
