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
	const targetPath = "CoreTests/Baselines/InheritanceUnions.truth";
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
			
			let baselineProgram: T.BaselineProgram | null = null;
			
			try
			{
				baselineProgram = baselineTest.parseFn(fileContent);
			}
			catch (e)
			{
				debugger;
				fail("Error occured while trying to parse the program");
				return;
			}
			
			let reports: string[] = [];
			
			try
			{
				reports = baselineTest.execFn(baselineProgram);
			}
			catch (e)
			{
				debugger;
				fail("Error occured while executing the program.");
				return;
			}
			
			for (const report of reports)
				expect(report).emit();
		});
	});
});
