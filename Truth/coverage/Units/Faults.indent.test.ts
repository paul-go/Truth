
namespace Truth.Test
{
	//import "../Framework/TestExtensionsImplementation";
	
	describe("Indentation Fault Tests", () =>
	{
		//
		test("Single indentation fault", () =>
		{
			const prog = new Program();
			const t = Syntax.tab;
			const s = Syntax.space;
			
			const lines = [
				"None",
				t + "Tab",
				s + "Space",
				t + s + "TabSpace"
			];
			
			prog.documents.create(lines.join("\n"));
			expect(prog).toHaveFault(Faults.TabsAndSpaces.code, 3);
			expect(prog.faults.count).toBe(1);
		});
		
		//
		test("Multiple indentation fault", () =>
		{
			const prog = new Program();
			const t = Syntax.tab;
			const s = Syntax.space;
			
			const lines = [
				"None",
				t + "Tab",
				t + s + "TabSpace",
				s + "Space",
				s + t + "SpaceTab"
			];
			
			prog.documents.create(lines.join("\n"));
			expect(prog).toHaveFault(Faults.TabsAndSpaces.code, 2);
			expect(prog).toHaveFault(Faults.TabsAndSpaces.code, 4);
			expect(prog.faults.count).toBe(2);
		});
		
		//
		test("Indentation fault rectification", () =>
		{
			const prog = new Program();
			const t = Syntax.tab;
			const s = Syntax.space;
			const lines = [t + s + "TabSpace"];
			
			const doc = prog.documents.create(lines.join("\n"));
			expect(prog).toHaveFault(Faults.TabsAndSpaces.code, 0);
			expect(prog.faults.count).toBe(1);
			
			doc.edit(facts =>
			{
				facts.delete(0, 1);
			});
			
			expect(prog.faults.count).toBe(0);
		});
	});
}
