import * as X from "./X";


/**
 * @internal
 * A service that watches the edit cycle on the document,
 * performs on-the-fly verification, and reports any faults
 * discovered.
 */
export class VerificationService
{
	/** */
	constructor(private readonly program: X.Program)
	{
		program.hooks.Revalidate.capture(hook =>
		{
			for (const statement of hook.parents)
				this.execFromParent(statement);
		});
	}
	
	/** */
	private execFromParent(statement: X.Statement)
	{
		const iter = statement.document.visitDescendants(statement, true);
		for (const subStatement of iter)
		{
			
		}
	}
	
	/** */
	private checkStatement(statement: X.Statement)
	{
		//this.program.inspect(statement.document, 
	}
	
	/** */
	private checkPointer(pointer: X.Pointer)
	{
		
	}
}
