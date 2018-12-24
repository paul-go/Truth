import * as X from "../X";
import * as T from "../T";
import "../Framework/TestExtensions";


//
describe("DocumentGraph Tests", () =>
{
	//
	test("Basic Linking", async () =>
	{
		const prog = new X.Program();
		const uri1 = T.FakeUri.file.truth();
		const uri2 = T.FakeUri.file.truth();
		const uri3 = T.FakeUri.file.truth();
		
		prog.documents.create(uri1, T.outdent`
			Doc1
		`);
		
		prog.documents.create(uri2, T.outdent`
			${uri1}
			Doc2
		`);
		
		prog.documents.create(uri3, T.outdent`
			${uri2}
			Doc3
			Doc3
		`);
		
		await prog.documents.await();
		const docs = prog.documents.toString();
		
		expect(docs).toBe(T.outdent`
			${uri1}
				Dependencies
					(undefined)
				Dependents
					${uri2}
			
			${uri2}
				Dependencies
					${uri1}
				Dependents
					${uri3}
			
			${uri3}
				Dependencies
					${uri2}
				Dependents
					(undefined)
		`);
	});
	
	//
	test("Basic Unlinking", async () =>
	{
		const prog = new X.Program();
		const uri1 = T.FakeUri.file.truth();
		const uri2 = T.FakeUri.file.truth();
		const uri3 = T.FakeUri.file.truth();
		
		const doc1 = prog.documents.create(uri1, T.outdent`
			Doc1
		`);
		
		const doc2 = prog.documents.create(uri2, T.outdent`
			${uri1}
			Doc2
		`);
		
		const doc3 = prog.documents.create(uri3, T.outdent`
			${uri2}
		`);
		
		await prog.documents.await();
		
		prog.documents.delete(doc3);
		
		const input = prog.documents.toString();
		const expected = T.outdent`
			${uri1}
				Dependencies
					(undefined)
				Dependents
					${uri2}
			
			${uri2}
				Dependencies
					${uri1}
				Dependents
					(undefined)
		`;
		
		expect(input).toBe(expected);
	});
	
	//
	test("Multiple references to the same document", async () =>
	{
		const prog = new X.Program();
		const uri1 = T.FakeUri.file.truth();
		const uri2 = T.FakeUri.file.truth();
		const uri3 = T.FakeUri.file.truth();
		
		const doc1 = prog.documents.create(uri1, "A");
		const doc2 = prog.documents.create(uri2, uri1);
		const doc3 = prog.documents.create(uri3, uri1);
		
		await prog.documents.await();
		
		const graphText1 = prog.documents.toString();
		const graphText1Expected = T.outdent`
			${uri1}
				Dependencies
					(undefined)
				Dependents
					${uri2}
					${uri3}
			
			${uri2}
				Dependencies
					${uri1}
				Dependents
					(undefined)
			
			${uri3}
				Dependencies
					${uri1}
				Dependents
					(undefined)
		`;
		
		expect(graphText1).toBe(graphText1Expected);
		
		prog.documents.delete(doc2);
		
		const graphText2 = prog.documents.toString();
		const graphText2Expected = T.outdent`
			${uri1}
				Dependencies
					(undefined)
				Dependents
					${uri3}
			
			${uri3}
				Dependencies
					${uri1}
				Dependents
					(undefined)
		`;
		
		expect(graphText2).toBe(graphText2Expected);
		
		prog.documents.delete(doc3);
		
		const graphText3 = prog.documents.toString();
		const graphText3Expected = T.outdent`
			${uri1}
				Dependencies
					(undefined)
				Dependents
					(undefined)
		`;
		
		expect(graphText3).toBe(graphText3Expected);
	});
	
	//
	test("Circular Linking (Erroneous)", async () =>
	{
		const prog = new X.Program();
		const uri1 = T.FakeUri.file.truth();
		const uri2 = T.FakeUri.file.truth();
		const doc1 = prog.documents.create(uri1, uri2);
		const doc2 = prog.documents.create(uri2, uri1);
		await prog.documents.await();
		
		//expect(doc2).toHaveFault(X.Faults.CircularResourceReference, 0);
		expect(prog.faults.count).toBe(1);
	});
	
	//
	test("Error recovery on erroneous link removal", async () =>
	{
		const prog = new X.Program();
		const uri1 = T.FakeUri.file.truth();
		const uri2 = T.FakeUri.file.truth();
		const doc1 = prog.documents.create(uri1, uri2);
		const doc2 = prog.documents.create(uri2, uri1);
		await prog.documents.await();
		
		expect(prog.faults.count).toBe(1);
		
		doc2.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		expect(prog.faults.count).toBe(0);
	});
});
