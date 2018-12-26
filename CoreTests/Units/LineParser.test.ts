import * as X from "../X";
import * as T from "../T";
import "../Framework/TestExtensions";


//
describe("Parser Tests", () =>
{
	const cases = Object.entries(T.Acceptance);
	
	test.each(cases)(`Parse "%s"`, (source: string, expected: T.IExpectation) =>
	{
		const parsedLine: X.Line = (() =>
		{
			let out: X.Line | null = null;
			
			try
			{
				out = X.LineParser.parse(source);
			}
			catch (e)
			{
				debugger;
				fail(e);
				return;
			}
			
			if (out === null)
			{
				if (expected.unparsable)
					return;
				
				debugger;
				fail("Line should not be parsable: " + source);
				return;
			}
			
			return out;
		})()!;
		
		const flagMissing = (flag: X.LineFlags) => (parsedLine.flags & flag) !== flag;
		
		if (expected.refresh && flagMissing(X.LineFlags.isRefresh))
		{
			debugger;
			fail("Line should have the refresh flag: " + source);
		}
		
		if (expected.refresh && flagMissing(X.LineFlags.isRefresh))
		{
			debugger;
			fail("Line should have the refresh flag: " + source);
		}
		
		if (expected.comment && flagMissing(X.LineFlags.isComment))
		{
			debugger;
			fail("Line should have the comment flag: " + source);
		}
		
		if (expected.whitespace && flagMissing(X.LineFlags.isWhitespace))
		{
			debugger;
			fail("Line should have the whitespace flag: " + source);
		}
		
		if (expected.uri && flagMissing(X.LineFlags.hasUri))
		{
			debugger;
			fail("Line should have the hasUri flag: " + source);
		}
		
		if (expected.total && flagMissing(X.LineFlags.hasTotalPattern))
		{
			debugger;
			fail("Line should have the total pattern flag: " + source);
		}
		
		if (expected.partial && flagMissing(X.LineFlags.hasPartialPattern))
		{
			debugger;
			fail("Line should have the partial pattern flag: " + source);
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
				const statementStr = statement === null ? null : statement.toString();
				if (expected.emit !== statementStr)
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
	});
});
