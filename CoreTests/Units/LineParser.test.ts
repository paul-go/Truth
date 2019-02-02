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
		
		if (expected.uri !== undefined)
		{
			if (flagMissing(X.LineFlags.hasUri))
			{
				debugger;
				fail("Line should have the hasUri flag: " + source);
			}
			else
			{
				const first = parsedLine.declarations.first();
				
				if (first !== null && first.subject instanceof X.Uri)
				{
					const uri = first.subject;
					
					if (expected.uri.protocol !== uri.protocol.toString())
					{
						debugger;
						expect(expected.uri.protocol).toBe(uri.protocol);
					}
					
					if (expected.uri.stores.join() !== uri.stores.join())
					{
						debugger;
						expect(expected.uri.stores).toEqual(uri.stores);
					}
					
					if (expected.uri.types)
					{
						if (expected.uri.types.join() !== uri.types.join())
						{
							debugger;
							expect(expected.uri.stores).toEqual(uri.stores);
						}
					}
					
					if (expected.uri.file !== undefined)
					{
						if (expected.uri.file !== uri.file)
						{
							debugger;
							expect(expected.uri.file).toBe(uri.file);
						}
					}
				}
				else
				{
					debugger;
					fail("No URI found at line: " + source);
				}
			}
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
				const statementStr = statement === null ? null : statement.toString(true);
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
			
			const firstDecl = (() =>
			{
				const first = parsedLine.declarations.first();
				return first ? first.subject : null;
			})();
			
			try
			{
				if (firstDecl instanceof X.Pattern)
				{
					if (matches)
						for (const match of matches)
							if (!firstDecl.test(match))
							{
								debugger;
								firstDecl.test(match);
								throw "Pattern does not match: " + match;
							}
					
					if (noMatches)
						for (const noMatch of noMatches)
							if (firstDecl.test(noMatch))
							{
								debugger;
								firstDecl.test(noMatch);
								throw "Pattern matches: " + noMatch;
							}
				}
			}
			catch (e)
			{
				debugger;
				fail("Error generated when trying to test: " + expected.match);
			}
		}
		
		if (expected.infixes !== undefined)
		{
			const firstDecl = (() =>
			{
				const first = parsedLine.declarations.first();
				return first ? first.subject : null;
			})();
			
			if (firstDecl instanceof X.Pattern)
			{
				const infixes = firstDecl.units.filter((u): u is X.Infix => u instanceof X.Infix);
				
				if (expected.infixes.length !== infixes.length)
				{
					debugger;
					fail(`Expected ${expected.infixes.length} infixes, but found ${infixes.length}`);
				}
				
				for (let nfxIdx = -1; ++nfxIdx < infixes.length;)
				{
					const act = infixes[nfxIdx];
					const actLhs = Array.from(act.lhs.eachSubject()).map(id => id.toString());
					const actRhs = Array.from(act.rhs.eachSubject()).map(id => id.toString());
					const exp = expected.infixes[nfxIdx];
					const expLhs = typeof exp.lhs === "string" ? [exp.lhs] : (exp.lhs || []);
					const expRhs = typeof exp.rhs === "string" ? [exp.rhs] : (exp.rhs || []);
					
					if (exp.kind === "Pattern" && !act.isPattern)
					{
						debugger;
						fail(`Infix ${nfxIdx} expected to be of the 'Pattern' variety.`);
						continue;
					}
					
					if (exp.kind === "Portability" && !act.isPortability)
					{
						debugger;
						fail(`Infix ${nfxIdx} expected to be of the 'Portability' variety.`);
						continue;
					}
					
					if (exp.kind === "Population" && !act.isPopulation)
					{
						debugger;
						fail(`Infix ${nfxIdx} expected to be of the 'Population' variety.`);
						continue;
					}
					
					if (exp.kind === "Nominal" && !act.isNominal)
					{
						debugger;
						fail(`Infix ${nfxIdx} expected to be of the 'Nominal' variety.`);
						continue;
					}
					
					if (act.lhs.length !== expLhs.length)
					{
						debugger;
						fail(`Identifier count of left side of infix ${nfxIdx} expected ` +
							`to be ${expLhs.length}. Found ${act.lhs.length}.`);
						continue;
					}
					
					if (act.rhs.length !== expRhs.length)
					{
						debugger;
						fail(`Identifier count of right side of infix ${nfxIdx} expected ` +
							`to be ${expRhs.length}. Found ${act.rhs.length}.`);
						continue;
					}
					
					for (let idIdx = -1; ++idIdx < expLhs.length;)
					{
						const expIdent = expLhs[idIdx];
						const actIdent = actLhs[idIdx];
						
						if (expIdent !== actIdent)
						{
							debugger;
							fail(`Left side identifier ${idIdx} of infix ${nfxIdx} does not match the expectation.`);
							continue;
						}
					}
					
					for (let idIdx = -1; ++idIdx < expRhs.length;)
					{
						const expIdent = expRhs[idIdx];
						const actIdent = actRhs[idIdx];
						
						if (expIdent !== actIdent)
						{
							debugger;
							fail(`Right side identifier ${idIdx} of infix ${nfxIdx} does not match the expectation.`);
							continue;
						}
					}
				}
			}
			else	
			{
				debugger;
				fail("Use of the 'infixes' check requires a Pattern.");
			}
		}
		
		if (expected.annotations !== undefined)
		{
			const actualAnnos = Array.from(parsedLine.annotations.eachSubject())
				.filter((anno): anno is X.Identifier => !!anno)
				.map(anno => anno.toString());
			
			const ea = expected.annotations;
			const expectedAnnos =
				typeof ea === "string" ? [ea] :
				Array.isArray(ea) ? ea :
				[];
			
			if (actualAnnos.length !== expectedAnnos.length)
			{
				debugger;
				fail("Statement does not have the expected set of annotations.");
			}
			else for (const expectedAnno of expectedAnnos)
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
