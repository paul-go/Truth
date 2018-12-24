import * as T from "../T";

describe("Execute Baselines", () =>
{
	const tests = Array.from(T.BaselineTestGenerator.generate().entries());
	
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
