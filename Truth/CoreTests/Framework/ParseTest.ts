import * as X from "../X";


/** */
export interface IAssertion
{
	flags?: X.LineFlags | X.LineFlags[],
	joint?: number,
	emit?: string,
	annotations?: string | string[]
	match?: string | string[],
	noMatch?: string | string[]
}


/**
 * 
 */
export class ParseTest
{
	/** */
	static exec(source: string, expected: IAssertion)
	{
		let parsedLine: X.Line | null = null;
		
		try
		{
			parsedLine = X.LineParser.parse(source);
		}
		catch (e)
		{
			debugger;
			fail(e);
			return;
		}
		
		if (expected.flags)
		{
			if (expected.flags === X.LineFlags.none)
			{
				if (parsedLine.flags !== X.LineFlags.none)
				{
					debugger;
					fail("Line should have no flags.");
				}
			}
			else
			{
				const assertionFlags: X.LineFlags[] = expected.flags instanceof Array ?
					expected.flags :
					[expected.flags];
				
				for (const flag of assertionFlags)
				{
					if ((parsedLine.flags & flag) !== flag)
					{
						debugger;
						fail("Missing expected LineFlag: " + X.LineFlags[flag]);
					}
				}
			}
		}
		
		if (expected.joint !== undefined)
		{
			if (parsedLine.jointPosition !== expected.joint)
			{
				debugger;
				fail("Joint expected at position: " + expected.joint);
			}
		}
		
		if (expected.emit !== undefined)
		{
			const fakeDocument = <X.Document>{};
			let statement: X.Statement | null = null;
			
			try
			{
				statement = new X.Statement(fakeDocument, parsedLine.sourceText);
			}
			catch (e)
			{
				debugger;
			}
			finally
			{
				if (statement === null || expected.emit !== statement.toString())
				{
					debugger;
					fail("Statement did not parse or emit correctly: " + expected.emit);
				}
			}
		}
		
		if (expected.match !== undefined || expected.noMatch !== undefined)
		{
			const matches = typeof expected.match === "string" ?
				[expected.match] :
				expected.match;
			
			const noMatches = typeof expected.noMatch === "string" ?
				[expected.noMatch] :
				expected.noMatch;
			
			let firstDecl: X.Identifier | X.Pattern | X.Uri | null = null;
			
			try
			{
				firstDecl = parsedLine.declarations.values().next().value;
				
				if (firstDecl instanceof X.Pattern)
				{
					if (matches)
						for (const match of matches)
							if (!firstDecl.test(match))
								throw "Pattern does not match: " + match;
					
					if (noMatches)
						for (const noMatch of noMatches)
							if (firstDecl.test(noMatch))
								throw "Pattern matches: " + noMatch;
				}
			}
			catch (e)
			{
				debugger;
				fail("Pattern does not match input: " + expected.match);
			}
		}
		
		if (expected.annotations !== undefined)
		{
			const actualAnnos = Array.from(parsedLine.annotations.values())
				.filter((anno): anno is X.Identifier => !!anno)
				.map(anno => anno.toString());
			
			if (actualAnnos.length !== expected.annotations.length)
			{
				debugger;
				fail("Statement does not have the expected set of annotations.");
			}
			else for (const expectedAnno of expected.annotations)
			{
				if (!actualAnnos.includes(expectedAnno))
				{
					debugger;
					fail("Statement does not have the annotation: " + expectedAnno);
				}
			}
		}
	}
}
