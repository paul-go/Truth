import * as X from "../Core/X";
import * as U from "./TestUtil";
import "./TestExtensions";


//
describe("Type Tests", () =>
{
	//
	test("Basic inheritance", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
			B : A
		`);
		
		expect(prog).toHaveFaults();
		
		doc.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		expect(prog).toHaveFaults(
			[X.UnresolvedAnnotationFault, doc.read(0).annotations[0]]
		);
	});
	
	//
	test("", () =>
	{
		const prog = new X.Program();
		
	});
});
