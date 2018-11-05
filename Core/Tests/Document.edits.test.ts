import * as X from "../X";
import * as U from "./TestUtil";
import "./TestExtensions";


describe("Document Edits", () =>
{
	// Hooks are disabled for document tests
	beforeEach(() => X.HookRouter.disabled = true);
	afterEach(() => X.HookRouter.disabled = false);
	
	/** */
	test(".edit() with single update", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			X
		`);
		
		doc.edit(facts =>
		{
			facts.update("Y", 0);
		});
		
		expect(doc.toString()).toBe("Y");
	});
	
	/** */
	test(".edit() with multiple updates", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			X
			Y
			Z
		`);
		
		doc.edit(facts =>
		{
			// Should do nothing
			facts.update("X", 0);
			
			// Should update
			facts.update("YY", 1);
			
			// Should do a double update
			facts.update("ZZ", 2);
			facts.update("ZZZ", 2);
		});
		
		expect(doc.toString()).toBe(U.outdent`
			X
			YY
			ZZZ
		`);
	});
	
	/** */
	test(".edit() with single insert", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
		`);
		
		doc.edit(facts =>
		{
			facts.insert("B", 1);
		});
		
		expect(doc.toString()).toBe(U.outdent`
			A
			B
		`);
	});
	
	/** */
	test.skip(".edit() with multiple inserts", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			
		`);
	});

	/** */
	test(".edit() simple delete", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
		`);
		
		doc.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		expect(doc.toString()).toBe("");
	});

	/** */
	test(".edit() parent deletion", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
				B
					C
					D
				F
		`);
		
		doc.edit(facts =>
		{
			facts.delete(1, 1);
		});
		
		expect(doc.toString()).toBe(U.outdent`
			A
				C
				D
				F
		`);
	});
	
	/** */
	test(".edit() nested parent deletion", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
				B
					C
						D
				F
		`);
		
		doc.edit(facts =>
		{
			facts.delete(1, 2);
		});
		
		expect(doc.toString()).toBe(U.outdent`
			A
				D
				F
		`);
	});
	
	/** */
	test(".edit() multiple nested parent deletion", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
				B
					C
						D
				F
					G
						H
				I
				J
		`);
		
		doc.edit(facts =>
		{
			// Delete "B"
			facts.delete(1, 1);
			
			// Delete "F", which is now one index back
			facts.delete(3, 1);
		});
		
		expect(doc.toString()).toBe(U.outdent`
			A
				C
					D
				G
					H
				I
				J
		`);
	});
	
	/** */
	test(".edit() update + insert + delete", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			Container
				WillUpdate
				WillDelete
				WillDelete
				WillUpdate
		`);
		
		doc.edit(facts =>
		{
			facts.update("	DidUpdate", 1);
			facts.delete(2, 2);
			facts.update("	DidUpdate", 2);
			facts.insert("	DidInsert", 1);
			facts.insert("	DidInsert", 10);
		});
		
		expect(doc.toString()).toBe(U.outdent`
			Container
				DidInsert
				DidUpdate
				DidUpdate
				DidInsert
		`);
	});
});
