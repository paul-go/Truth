import * as X from "../X";
import "../Framework/TestExtensions";


//
describe("Parser Tests", () =>
{
	//
	test("Basic", () =>
	{
		
		runParseTest("Backslash\\", {
			
		});
		
		runParseTest("A : B\\", {
			
		});
		
		// Pattern Parsing
		runParseTest("/[A-Z0-9/ : X", {
			flags: X.LineFlags.hasPattern
		});
		
		runParseTest("", {
			
		});
	});
	
	/** */
	function runParseTest(source: string, assertion: IAssertion)
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
		
		if (assertion.flags)
		{
			const assertionFlags: X.LineFlags[] = assertion.flags instanceof Array ?
				assertion.flags :
				[assertion.flags];
			
			for (const flag of assertionFlags)
			{
				if ((parsedLine.flags | flag) !== flag)
				{
					debugger;
					fail("Missing expected LineFlag: " + X.LineFlags[flag]);
				}
			}
		}
		
		if (assertion.joint !== undefined)
		{
			if (parsedLine.jointPosition !== assertion.joint)
			{
				debugger;
				fail("Joint expected at position: " + assertion.joint);
			}
		}
		
		if (assertion.emit !== undefined)
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
				if (statement === null || assertion.emit !== statement.toString())
				{
					debugger;
					fail("Statement did not parse or emit correctly: " + assertion.emit);
				}
			}
		}
		
		if (assertion.match !== undefined)
		{
			let firstDecl: X.Identifier | X.Pattern | X.Uri | null = null;
			
			try
			{
				firstDecl = parsedLine.declarations.values().next().value;
				
				if (firstDecl instanceof X.Pattern)
					if (!firstDecl.test(assertion.match))
						throw "unmatched";
			}
			catch (e)
			{
				debugger;
				fail("Pattern does not match input: " + assertion.match);
			}
		}
		
		if (assertion.annotations !== undefined)
		{
			const annotationTexts = Array.from(parsedLine.annotations.values())
				.filter((anno): anno is X.Identifier => !!anno)
				.map(anno => anno.toString());
			
			for (const expectedAnno of assertion.annotations)
			{
				if (!annotationTexts.includes(expectedAnno))
				{
					debugger;
					fail("Statement does not have the annotation: " + expectedAnno);
				}
			}
		}
	}
	
	interface IAssertion
	{
		flags?: X.LineFlags | X.LineFlags[],
		joint?: number,
		emit?: string,
		match?: string,
		annotations?: string | string[]
	}
});
