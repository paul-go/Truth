
namespace Truth
{
	/**
	 * A fixture for a cover function that captures the behavior of parsing
	 * a single line of Truth.
	 */
	export function createLineCover(
		statementText: string,
		expected: ILineCoverExpectation)
	{
		const options: IParserOptions = {
			assumedUri: Not.null(KnownUri.fromString(UriProtocol.memory + "//0.truth")),
			readPatterns: true,
			readUris: true
		};
		
		let statement: Statement | null = null;
		
		try
		{
			statement = Statement.newTemporary(statementText, options);
		}
		catch (e)
		{
			debugger;
			return e;
		}
		
		if (statement === null)
		{
			if (expected.unparsable)
				return () => expected.unparsable;
			
			debugger;
			return new Error("Line should not be parsable: " + statementText);
		}
		
		const verifiers: (() => any)[] = [];
		
		if (expected.comment && statement.isComment)
		{
			debugger;
			return fail("Line should have the comment flag: " + statementText);
		}
		
		if (expected.whitespace && statement.isWhitespace)
		{
			debugger;
			return fail("Line should have the whitespace flag: " + statementText);
		}
		
		const first = statement.declarations[0].boundary.subject;
		
		if (expected.uri === undefined && !!first && first instanceof KnownUri)
		{
			debugger;
			return fail("Line should not have parsed as a URI.");
		}
		
		if (expected.uri !== undefined)
		{
			if (expected.uri && !statement.uri)
			{
				debugger;
				return fail("Statement should have been parsed as a URI: " + statementText);
			}
			else if (first !== null && first instanceof KnownUri)
			{
				verifiers.push(() => first instanceof KnownUri);
			}
			else
			{
				debugger;
				return fail("No URI found at line: " + statementText);
			}
		}
		
		if (expected.joint !== undefined)
		{
			if (statement.jointOffset !== expected.joint)
			{
				debugger;
				return fail("Joint expected at position: " + expected.joint);
			}
		}
		
		if (expected.emit !== undefined)
		{
			const fakeDocument = <Document>{};
			const statementStr = statement.toString(true);
			
			if (expected.emit !== statementStr)
			{
				debugger;
				return fail("Statement did not parse or emit correctly: " + expected.emit);
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
			
			const firstDecl = statement.declarations[0]?.boundary.subject;
			
			try
			{
				if (firstDecl instanceof Pattern)
				{
					if (matches)
						for (const match of matches)
							if (!firstDecl.test(match))
							{
								debugger;
								firstDecl.test(match);
								throw new Error("Pattern does not match: " + match);
							}
					
					if (noMatches)
						for (const noMatch of noMatches)
							if (firstDecl.test(noMatch))
							{
								debugger;
								firstDecl.test(noMatch);
								throw new Error("Pattern matches: " + noMatch);
							}
				}
			}
			catch (e)
			{
				debugger;
				return fail("Error generated when trying to test: " + expected.match);
			}
		}
		
		if (expected.infixes !== undefined)
		{
			const firstDecl = statement.declarations[0]?.boundary.subject;
			if (firstDecl instanceof Pattern)
			{
				const infixes = firstDecl.units.filter((u): u is Infix => u instanceof Infix);
				
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
					const expLhs = typeof exp.lhs === "string" ? [exp.lhs] : exp.lhs || [];
					const expRhs = typeof exp.rhs === "string" ? [exp.rhs] : exp.rhs || [];
					
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
						fail(`Term count of left side of infix ${nfxIdx} expected ` +
							`to be ${expLhs.length}. Found ${act.lhs.length}.`);
						continue;
					}
					
					if (act.rhs.length !== expRhs.length)
					{
						debugger;
						fail(`Term count of right side of infix ${nfxIdx} expected ` +
							`to be ${expRhs.length}. Found ${act.rhs.length}.`);
						continue;
					}
					
					for (let idIdx = -1; ++idIdx < expLhs.length;)
					{
						const expTerm = expLhs[idIdx];
						const actTerm = actLhs[idIdx];
						
						if (expTerm !== actTerm)
						{
							debugger;
							fail(`Unexpected left side term ${idIdx} of infix ${nfxIdx}`);
							continue;
						}
					}
					
					for (let idIdx = -1; ++idIdx < expRhs.length;)
					{
						const expTerm = expRhs[idIdx];
						const actTerm = actRhs[idIdx];
						
						if (expTerm !== actTerm)
						{
							debugger;
							fail(`Unexpected right side term ${idIdx} of infix ${nfxIdx}`);
							continue;
						}
					}
				}
			}
			else	
			{
				debugger;
				return fail("Use of the 'infixes' check requires a Pattern.");
			}
		}
		
		if (expected.annotations !== undefined)
		{
			const actualAnnos = Array.from(statement.annotations)
				.map(span => span.boundary.subject)
				.filter((anno): anno is Term => !!anno)
				.map(anno => anno.toString());
			
			const ea = expected.annotations;
			const expectedAnnos =
				typeof ea === "string" ? [ea] :
				Array.isArray(ea) ? ea :
				[];
			
			if (actualAnnos.length !== expectedAnnos.length)
			{
				debugger;
				return fail("Statement does not have the expected set of annotations.");
			}
			else for (const expectedAnno of expectedAnnos)
			{
				if (!actualAnnos.includes(expectedAnno))
				{
					debugger;
					return fail("Statement does not have the annotation: " + expectedAnno);
				}
			}
		}
	}
	
	/**
	 * 
	 */
	export interface ILineCoverExpectation
	{
		/**
		 * Indicates whether or not the statement should be parsable.
		 */
		unparsable?: boolean;
		
		/**
		 * Indicates whether or not the statement should be a comment.
		 */
		comment?: boolean;
		
		/**
		 * Indicates whether or not the statement should be marked as
		 * one containing only whitespace characters.
		 */
		whitespace?: boolean;
		
		/**
		 * Indicates whether or not the statement should be found to
		 * have a URI as it's sole declaration.
		 */
		uri?: boolean;
		
		/**
		 * Indicates whether or not the statement should be found to
		 * have pattern as it's sole declaration, and which happens to
		 * be a "total pattern".
		 */
		total?: boolean;
		
		/**
		 * Indicates whether or not the statement should be found to
		 * have pattern as it's sole declaration, and which happens to
		 * be a "partial pattern".
		 */
		partial?: boolean;
		
		/**
		 * Indicates the character position within the statement where
		 * the joint operator should be found.
		 */
		joint?: number;
		
		/**
		 * Indicates what should be emitted as text after the statement
		 * has been parsed, and is then converted back to a string.
		 */
		emit?: string;
		
		/**
		 * Indicates the annotation or array of annotations that should
		 * be found on the statement. (An empty array or empty string
		 * indicates that no annotations should be found on the statement).
		 */
		annotations?: string | string[];
		
		/**
		 * Indicates that the statement was found to have a pattern as
		 * it's sole declaration (which may be either a "total" or a "partial"
		 * pattern), and that the specified string or array of strings should
		 * each be matchable by this pattern.
		 */
		match?: string | string[];
		
		/**
		 * Similar to match, but reversed in that the string or strings should
		 * NOT be matchable by the pattern.
		 */
		noMatch?: string | string[];
		
		/**
		 * 
		 */
		infixes?: {
			kind: "Pattern" | "Portability" | "Population" | "Nominal";
			lhs?: string | string[];
			rhs?: string | string[];
		}[];
	}
	
	/** */
	function fail(message: string)
	{
		return new Error(message);
	}
}
