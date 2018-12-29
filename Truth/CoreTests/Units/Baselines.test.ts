import * as X from "../X";
import * as T from "../T";


describe("Execute Baselines", () =>
{
	/**
	 * NOTE TO TESTERS:
	 * 
	 * This is the path of the baseline file that will be loaded and
	 * tested. A directory can be specified here, in which case,
	 * all files ending in the ".truth" extension will be loaded and
	 * tested in the specified directory. Or, a single file can be
	 * referenced to run an isolated test.
	 */
	const targetPath = "CoreTests/Baselines/";
	const testMap = T.BaselineTestGenerator.generate(targetPath);
	const tests = Array.from(testMap.entries());
	
	expect.extend({
		emit: (report: string) => ({
			message: () => report,
			pass: false
		})
	});
	
	tests.forEach(value =>
	{
		tests;
		const title = value[0];
		const baselineTest = value[1];
		
		test(title, async () =>
		{
			tests;
			title;
			
			let fileContent: string = "";
			
			try
			{
				fileContent = await baselineTest.loadFn();
			}
			catch (e)
			{
				debugger;
				fail(`Baseline file did not load.`);
				return
			}
			
			let baselineDocs: T.BaselineDocuments | null = null;
			
			try
			{
				baselineDocs = baselineTest.parseFn(fileContent);
			}
			catch (e)
			{
				debugger;
				fail("Error occured while trying to parse the program");
				return;
			}
			
			let program: X.Program | null = null;
			let reports: string[] = [];
			
			try
			{
				[program, reports] = baselineTest.execFn(baselineDocs);
			}
			catch (e)
			{
				debugger;
				fail("Error occured while executing the program.");
				return;
			}
			
			if (baselineDocs.graphOutput)
			{
				const programGraphOutput = program.graph.toString();
				if (baselineDocs.graphOutput !== programGraphOutput)
				{
					debugger;
					expect(programGraphOutput).toBe(baselineDocs.graphOutput);
				}
			}
			
			for (const report of reports)
				expect(report).emit();
			
		});
	});
});
