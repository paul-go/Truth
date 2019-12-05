
namespace Truth.Test
{
	const Fs = <typeof import("fs")>require("fs");
	const Path = <typeof import("path")>require("path");
	
	/**
	 * 
	 */
	export interface IBaselineTest
	{
		/** */
		readonly loadFn: () => Promise<string>;
		
		/** */
		readonly parseFn: (sourceFile: string) => BaselineDocuments;
		
		/** */
		readonly execFn: (prog: BaselineDocuments) => [Program, string[]];
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
				Fs.readdirSync(targetPath, "utf8")
					.filter(s => s.endsWith(".truth"))
					.map(s => Path.join(fullPath, s));
			
			filePaths.forEach(filePath =>
			{
				testMap.set("Executing: " + filePath, <IBaselineTest>{
					loadFn: async () => await Fs.promises.readFile(filePath, "utf8"),
					parseFn: (sourceFile: string) => BaselineParser.parse(filePath, sourceFile),
					execFn: (prog: BaselineDocuments) => this.execTest(prog, filePath)
				});
			});
			
			return testMap;
		}
		
		/**
		 * 
		 */
		private static execTest(baselineDocs: BaselineDocuments, baselineFilePath: string)
		{
			const realProgram = new Program();
			const reports: Report[] = [];
			
			// Errors need to be blocked from checking while
			// the program is populated with content.
			
			for (const [fakeUriText, baselineDoc] of baselineDocs.documents)
			{
				const fakeUri = Uri.tryParse(fakeUriText);
				if (!fakeUri)
					throw Exception.unknownState();
				
				realProgram.documents.create(fakeUri, baselineDoc.sourceText);
			}
			
			// Go through all BaselineDocument instances, and make sure that 
			// faults are reported (and not reported) in the locations as specified
			// by the BaselineDocument's checks.
			
			for (const [fakeUriText, baselineDoc] of baselineDocs.documents)
			{
				const fakeUri = Not.null(Uri.tryParse(fakeUriText));
				const realDoc = Not.null(realProgram.documents.get(fakeUri));
				
				for (const [docLineIdx, baselineLine] of baselineDoc.baselineLines.entries())
				{
					const statement = realDoc.read(docLineIdx);
					const reportedFaults = realProgram.faults.check(statement);
					const checks = baselineLine.checks;
					
					const faultChecks = checks.filter((chk): chk is FaultCheck => 
						chk instanceof FaultCheck);
					
					const inferenceChecks = checks.filter((chk): chk is InferenceCheck =>
						chk instanceof InferenceCheck);
					
					const descendantChecks = checks.filter((chk): chk is DescendantCheck =>
						chk instanceof DescendantCheck);
					
					// Handle the faultChecks
					if (faultChecks.length > 0 || reportedFaults.length > 0)
					{
						const expected: string[] = [];
						const received: string[] = [];
						
						for (const [spanIdx, span] of statement.spans.entries())
						{
							const checks = faultChecks.filter(chk => chk.spanIndex === spanIdx);
							const expCodes = checks.map(chk => chk.faultCode);
							const expNames = expCodes.map(code => Faults.nameOf(code));
							expected.push(serializeSpan(span, expCodes, expNames));
							
							const recFaults = realProgram.faults.check(span);
							const recCodes = recFaults.map(f => f.type.code);
							const recNames = recCodes.map(code => Faults.nameOf(code));
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
					
					//! TODO: Handle inference checks
					//! TODO: Handle descendent checks
				}
			}
			
			const reportStrings: string[] = [];
			
			for (const report of reports)
			{
				const reportLines = [
					"Line: " + report.documentLineNumber,
					"Source: " + report.lineSource,
					...report.messages
				];
				
				reportStrings.push(reportLines.join("\n"));
			}
			
			return [realProgram, reportStrings];
		}
	}


	/** */
	function serializeSpan(span: Span, codes: number[], names: string[])
	{
		const parts = [span.toString()];
		
		if (codes.length !== names.length)
			throw Exception.unknownState();
		
		if (codes.length > 0)
		{
			for (const [i, code] of codes.entries())
			{
				parts.push(BaselineSyntax.faultBegin + code + BaselineSyntax.faultEnd);
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
	class Report
	{
		constructor(
			readonly fileName: string,
			readonly documentLineNumber: number,
			readonly lineSource: string,
			readonly messages: string[])
		{ }
	}
}
