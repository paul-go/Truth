import * as T from "../T";

describe.only("Execute Baselines", () =>
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
	const targetPath = "CoreTests/Baselines/Fragmentation.truth";
	
	const testMap = T.BaselineTestGenerator.generate(targetPath);
	const tests = Array.from(testMap.entries());
	
	tests.forEach(value =>
	{
		tests;
		const title = value[0];
		const testFn = value[1];
		
		test(title, async () =>
		{
			tests;
			title;
			const reports = await testFn();
			expect(reports).toBe("");
		});
	});
});
