import * as X from "../X";
import * as T from "../T";
import "../Framework/TestExtensions";


//
describe("Type Tests", () =>
{
	// Deprecate this test 
	test("Basic inheritance", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
			B : A
		`);
		
		expect(prog).toHaveFaults();
		
		doc.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		//expect(prog).toHaveFaults(
		//	[X.UnresolvedAnnotationFault, doc.read(0).annotations[0]]
		//);
	});
});
