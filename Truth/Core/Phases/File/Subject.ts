import * as X from "../../X";


/** */
export type Subject = X.Identifier | X.ForePattern | string;


/** */
export class SubjectParser
{
	/** */
	static invoke(text: string): Subject
	{
		if (text.trim().length === 0)
			throw X.ExceptionMessage.invalidArgument();
		
		if (X.ForePattern.canParse(text))
			return X.ForePattern.parse(text)!;
		
		return new X.Identifier(text);
	}
	
	private constructor() { }
}
