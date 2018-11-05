import * as X from "./X";


/**
 * 
 */
export class TypeChecker
{
	/** */
	constructor(private readonly program: X.Program)
	{
		program.hooks.Revalidate.capture(hook =>
		{
			// Perform type checking, and call program.report
			// when errors are found.
		});
	}
}