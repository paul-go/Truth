import * as X from "../X";
import * as T from "../T";
import * as Fs from "fs";
import * as Path from "path";


/**
 * 
 */
export interface IBaselineTest
{
	/** */
	readonly loadFn: () => Promise<string>;
	
	/** */
	readonly parseFn: (sourceFile: string) => T.BaselineProgram;
	
	/** */
	readonly execFn: (prog: T.BaselineProgram) => string[];
}


/**
 * 
 */
export class BaselineTestGenerator
{
	/**
	 * Generates test functions for baselines.
	 * 
	 * @param targetPath Specifies the path to where the 
	 * baseline files are located. If the path specified refers
	 * to a file, only a single test function is generated. If the
	 * argument is omitted, the default baseline directory is
	 * used.
	 * 
	 * @returns A Map object whose keys are test title strings,
	 * and whose values are asynchronous test functions.
	 */
	static generate(targetPath = "")
	{
		const fullPath = Path.join(process.cwd(), targetPath !== "" ?
			targetPath :
			"CoreTests/Baselines");
		
		const testMap = new Map<string, IBaselineTest>();
		const filePaths = fullPath.endsWith(".truth") ?
			[fullPath] :
			Fs.readdirSync(targetPath, "utf8");
		
		filePaths.forEach(filePath =>
		{
			testMap.set("Executing: " + filePath, <IBaselineTest>{
				loadFn: async () => await Fs.promises.readFile(filePath, "utf8"),
				parseFn: (sourceFile: string) => T.BaselineParser.parse(sourceFile),
				execFn: (prog: T.BaselineProgram) => this.execTest(prog, filePath)
			});
		});
		
		return testMap;
	}
	
	/**
	 * 
	 */
	private static execTest(baselineProgram: T.BaselineProgram, baselineFilePath: string)
	{
		const realProgram = new X.Program(false);
		const reports: Report[] = [];
		
		// Errors need to be blocked from checking while
		// the program is populated with content.
		
		for (const [fakeUriText, baselineDoc] of baselineProgram.documents)
		{
			const fakeUri = X.Uri.parse(fakeUriText);
			if (!fakeUri)
				throw X.Exception.unknownState();
			
			realProgram.documents.create(fakeUri, baselineDoc.sourceText);
		}
		
		// Go through all BaselineDocument instances, and make sure that 
		// faults are reported (and not reported) in the locations as specified
		// by the BaselineDocument's checks.
		
		for (const [fakeUriText, baselineDoc] of baselineProgram.documents)
		{
			const fakeUri = X.Uri.parse(fakeUriText)!;
			const realDoc = realProgram.documents.get(fakeUri)!;
			
			for (const [docLineIdx, baselineLine] of baselineDoc.baselineLines.entries())
			{
				const statement = realDoc.read(docLineIdx);
				const reportedFaults = realProgram.faults.check(statement);
				const checks = baselineLine.checks;
				
				const faultChecks = checks.filter((chk): chk is T.FaultCheck => 
					chk instanceof T.FaultCheck);
				
				const inferenceChecks = checks.filter((chk): chk is T.InferenceCheck =>
					chk instanceof T.InferenceCheck);
				
				const descendantChecks = checks.filter((chk): chk is T.DescendantCheck =>
					chk instanceof T.DescendantCheck);
				
				// Handle the faultChecks
				if (faultChecks.length > 0 || reportedFaults.length > 0)
				{
					const expected: string[] = [];
					const received: string[] = [];
					
					for (const [spanIdx, span] of statement.spans.entries())
					{
						const checks = faultChecks.filter(chk => chk.spanIndex === spanIdx);
						const expCodes = checks.map(chk => chk.faultCode);
						const expNames = expCodes.map(code => X.Faults.nameOf(code));
						expected.push(serializeSpan(span, expCodes, expNames));
						
						const recFaults = realProgram.faults.check(span);
						const recCodes = recFaults.map(f => f.type.code);
						const recNames = recCodes.map(code => X.Faults.nameOf(code));
						received.push(serializeSpan(span, recCodes, recNames));
					}
					
					const splitter = "   ";
					const expectedSerialized = expected.join(splitter);
					const receivedSerialized = received.join(splitter);
					
					if (expectedSerialized !== receivedSerialized)
					{
						reports.push(new Report(
							baselineFilePath,
							docLineIdx + 1,
							baselineLine.line.sourceText,
							[
								"Expected faults: " + expectedSerialized,
								"Received faults: " + receivedSerialized
							]));
					}
				}
				
				// TODO: Handle inference checks
				
				
				// TODO: Handle descendent checks
				
				
			}
		}
		
		const reportStrings: string[] = [];
		
		for (const report of reports)
		{
			// FaultCheck format:
			// 
			// StatementBeginFault.truth:5
			// 	Expected faults: A -- B (CircularResourceReference) -- C
			// 	Received faults: A -- B -- C (CircularResourceReference)
			
			// InferenceCheck format:
			//
			// PatternWithSlash.truth:45
			//	Expected inference: A, B
			//	Received inference: (none)
			
			// DescendantCheck format:
			//
			// RecursionDouble.truth:3
			//	Missing or improperly typed descendent: A/B/C : D
			
			const reportLines = [
				"Line: " + report.documentLineNumber,
				"Source: " + report.lineSource,
				...report.messages
			];
			
			reportStrings.push(reportLines.join("\n"));
		}
		
		return reportStrings;
	}
}


/** */
function serializeSpan(span: X.Span, codes: number[], names: string[])
{
	const parts = [span.subject.toString()];
	
	if (codes.length !== names.length)
		throw X.Exception.unknownState();
	
	if (codes.length > 0)
	{
		for (const [i, code] of codes.entries())
		{
			parts.push(T.BaselineSyntax.faultBegin + code + T.BaselineSyntax.faultEnd);
			parts.push("(" + names[i] + ")");
		}
	}
	else
	{
		parts.push("(none)");
	}
	
	return parts.join(" ");
}


/** */
function setSubtract<T>(setA: Set<T>, setB: Set<T>)
{
	const out = new Set<T>();
	
	for (const item of setA)
		if (!(setB.has(item)))
			out.add(item);
	
	return out;
}


class Report
{
	constructor(
		readonly fileName: string,
		readonly documentLineNumber: number,
		readonly lineSource: string,
		readonly messages: string[])
	{ }
}
