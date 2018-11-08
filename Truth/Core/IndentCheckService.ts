import * as X from "./X";


/**
 * @internal
 * A class that checks for strange indentation in
 * statements, and reports warnings.
 */
export class IndentCheckService
{
	/**
	 * Test-only field used to disable the indent checker.
	 */
	static disabled: boolean | null;
	
	/** */
	constructor(private readonly program: X.Program)
	{
		program.hooks.Revalidate.capture(hook =>
		{
			this.check(hook.parents);
		});
		
		program.hooks.DocumentCreated.capture(hook =>
		{
			this.check(hook.document);
		});
	}
	
	/**
	 * Performs statement-level indent checking, 
	 * starting at the specified root.
	 */
	private check(root: ReadonlyArray<X.Statement> | X.Document)
	{
		const warningStatements: X.Statement[] = [];
		
		const iterate = (statement: X.Statement) =>
		{
			let hasTabs = false;
			let hasSpaces = false;
			
			for (let i = -1; ++i < statement.indent;)
			{
				const char = statement.textContent[i];
				
				if (char === X.Syntax.tab)
					hasTabs = true;
				
				if (char === X.Syntax.space)
					hasSpaces = true;
			}
			
			if (hasTabs && hasSpaces)
				warningStatements.push(statement);
		}
		
		if (root instanceof X.Document)
		{
			for (const descendent of root.visitDescendants())
				iterate(descendent.statement);
		}
		else for (const parent of root)
			for (const descendent of parent.document.visitDescendants(parent, true))
				iterate(descendent.statement);
		
		for (const warningStatement of warningStatements)
		{
			const fault = new X.TabsAndSpacesFault(warningStatement);
			this.program.faults.report(fault);
		}
	}
}
