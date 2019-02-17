import * as X from "../X";
import "../Framework/TestExtensionsImplementation";


describe("Indentation Fault Tests", () =>
{
	//
	test("Single indentation fault", () =>
	{
		const prog = new X.Program();
		const t = X.Syntax.tab;
		const s = X.Syntax.space;
		
		const lines = [
			"None",
			t + "Tab",
			s + "Space",
			t + s + "TabSpace"
		];
		
		prog.documents.create(lines.join("\n"));
		expect(prog).toHaveFault(X.Faults.TabsAndSpaces.code, 3);
		expect(prog.faults.count).toBe(1);
	});
	
	//
	test("Multiple indentation fault", () =>
	{
		const prog = new X.Program();
		const t = X.Syntax.tab;
		const s = X.Syntax.space;
		
		const lines = [
			"None",
			t + "Tab",
			t + s + "TabSpace",
			s + "Space",
			s + t + "SpaceTab"
		];
		
		prog.documents.create(lines.join("\n"));
		expect(prog).toHaveFault(X.Faults.TabsAndSpaces.code, 2);
		expect(prog).toHaveFault(X.Faults.TabsAndSpaces.code, 4);
		expect(prog.faults.count).toBe(2);
	});
	
	//
	test("Indentation fault rectification", () =>
	{
		const prog = new X.Program();
		const t = X.Syntax.tab;
		const s = X.Syntax.space;
		
		const lines = [
			t + s + "TabSpace"
		];
		
		const doc = prog.documents.create(lines.join("\n"));
		expect(prog).toHaveFault(X.Faults.TabsAndSpaces.code, 0);
		expect(prog.faults.count).toBe(1);
		
		doc.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		expect(prog.faults.count).toBe(0);
	});
});
