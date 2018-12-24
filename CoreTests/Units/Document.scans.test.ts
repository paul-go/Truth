import * as X from "../X";
import * as T from "../T";
import "../Framework/TestExtensions";


describe("Document Scans", () =>
{
	// Hooks are disabled for document tests
	beforeEach(() => X.HookRouter.disabled = true);
	afterEach(() => X.HookRouter.disabled = false);
	
	//
	test(".getAncestry() with a statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				B
					C
						D
							E
		`);
		
		const ancestryAtA = doc.getAncestry(doc.read(0))!;
		const ancestryAtB = doc.getAncestry(doc.read(1))!;
		const ancestryAtC = doc.getAncestry(doc.read(2))!;
		const ancestryAtD = doc.getAncestry(doc.read(3))!;
		const ancestryAtE = doc.getAncestry(doc.read(4))!;
		
		expect(ancestryAtA).toRead(``);
		
		expect(ancestryAtB).toRead(`
			A
		`);
		
		expect(ancestryAtC).toRead(`
			A
			B
		`);
		
		expect(ancestryAtD).toRead(`
			A
			B
			C
		`);
		
		expect(ancestryAtE).toRead(`
			A
			B
			C
			D
		`);
	});


	//
	test(".getAncestry() with a number", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				B
					C
						D
							E
		`);
		
		const ancestry = doc.getAncestry(3);
		expect(ancestry).toRead(`
			A
			B
			C
		`);
	});

	//
	test(".getParent() with a statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				B
					C
		`);
		
		const stmtA = doc.read(0);
		const stmtB = doc.read(1);
		const stmtC = doc.read(2);
		const stmtBParent = doc.getParent(stmtB);
		const stmtCParent = doc.getParent(stmtC);
		
		expect(stmtBParent).toBe(stmtA);
		expect(stmtCParent).toBe(stmtB);
	});

	//
	test(".getParent() with a number", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				B
					C
		`);
		
		const stmtA = doc.read(0);
		const stmtBParent = doc.getParent(1);
		
		expect(stmtBParent).toBe(stmtA);
	});

	/** */
	test(".getParent() with a top-level statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
			// 
			B
			//
			C
		`);
		
		const parentA = doc.getParent(0);
		const parentB = doc.getParent(2);
		const parentC = doc.getParent(4);
		
		expect(parentA).toBe(doc);
		expect(parentB).toBe(doc);
		expect(parentC).toBe(doc);
	});

	/** */
	test(".getParentFromPosition() with an empty document", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create("");
		
		const parent = doc.getParentFromPosition(0, 0);
		expect(parent).toBe(doc);
	});

	/** */
	test(".getParentFromPosition() on an empty line", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				B
					C
						D
							
				E
					F
		`);
		
		const a = doc.read(0);
		const b = doc.read(1);
		const c = doc.read(2);
		const d = doc.read(3);
		
		const parentAt1 = doc.getParentFromPosition(4, 1);
		const parentAt2 = doc.getParentFromPosition(4, 2);
		const parentAt3 = doc.getParentFromPosition(4, 3);
		const parentAt4 = doc.getParentFromPosition(4, 4);
		
		expect(parentAt1).toBe(a);
		expect(parentAt2).toBe(b);
		expect(parentAt3).toBe(c);
		expect(parentAt4).toBe(d);
	});

	/** */
	test(".getParentFromPosition() on a non-empty line", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				B
					C
						D
		`);
		
		const a = doc.read(0);
		const b = doc.read(1);
		const c = doc.read(2);
		
		const parentOfB = doc.getParentFromPosition(4, 1);
		const parentOfC = doc.getParentFromPosition(4, 2);
		const parentOfD = doc.getParentFromPosition(4, 3);
		
		expect(parentOfB).toBe(a);
		expect(parentOfC).toBe(b);
		expect(parentOfD).toBe(c);
	});

	/** */
	test(".getParentFromPosition() returning containing document", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(`
			A
				B
					C
						D
		`);
		
		const container = doc.getParentFromPosition(3, 0);
		expect(container).toBe(doc);
	});

	/** */
	test(".getSiblings() on a top-level statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
					A
				B
			C
				D
					E
		`);
		
		const c = doc.read(2);
		const siblings = doc.getSiblings(c);
		
		expect(siblings).toRead(T.outdent`
			A
			B
			C
		`);
	});

	/** */
	test(".getSiblings() on a nested statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				
				B
				//
				C
						D
					E
				
				F
			G
				H
		`);
		
		const c = doc.read(4);
		const siblings = doc.getSiblings(c);
		
		expect(siblings).toRead(T.outdent`
			B
			C
			F
		`);
	});

	/** */
	test(".getSiblings() on a top-level no-op statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
			//
			B
		`);
		
		const cmt = doc.read(1);
		const siblings = doc.getSiblings(cmt);
		
		expect(siblings).toBeNull();
	});

	/** */
	test(".getSiblings() on a nested no-op statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				B
				//
				//
				//
				C
			D
		`);
		
		const siblings = doc.getSiblings(3);
		expect(siblings).toBeNull();
	});

	/** */
	test(".getChildren() on an empty document", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create("\t".repeat(5));
		const children = doc.getChildren();
		
		expect(children).toRead(``);
	});

	/** */
	test(".getChildren() on a non-empty document", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
						B
							//
						//
							NOT
							CHILD
							OF
							SUBJECT A
					C
				D
				E
			F
		`);
		
		const stmtA = doc.read(0);
		const stmtB = doc.read(1);
		const stmtC = doc.read(8);
		const stmtD = doc.read(9);
		const stmtE = doc.read(10);
		const children = doc.getChildren(stmtA);
		
		expect(children).toEqual(expect.arrayContaining([
			stmtB,
			stmtC,
			stmtD,
			stmtE]));
	});

	/** */
	test.skip(".getChildren() on a top-level statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".getChildren() on a nested statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".getChildren() on a nested no-op statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".hasDecendents() on an empty document", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".hasDecendents() on a non-empty document", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".hasDecendents() on a top-level statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".hasDecendents() on a nested statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".hasDecendents() on a nested no-op statement", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".hasDecendents() on a statement at a numeric position", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test.skip(".getStatementIndex()", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});

	/** */
	test(".getNotes() standard case", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
				// **
				// **
				B
		`);
		
		const notes = doc.getNotes(3);
		expect(notes).toEqual(expect.arrayContaining([
			"**",
			"**"
		]));
	});

	/** */
	test(".getNotes() when there is none", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
			B
		`);
		
		const notes = doc.getNotes(2).join("");
		expect(notes).toBe("");
	});

	/** */
	test(".getNotes() on a comment line", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			// ***
			// ***
		`);
		
		const notes = doc.getNotes(1).join("");
		expect(notes).toBe("");
	});

	/** */
	test(".read() of line from possible positions", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			A
			B
			C
		`);
		
		const aFromZero = doc.read(0);
		const aFromNegative = doc.read(-3);
		expect(aFromZero).toBe(aFromNegative);
		
		const cFromPos = doc.read(2);
		const cFromNeg = doc.read(-1);
		const cFromBeyond = doc.read(3);
		
		expect(cFromPos).toBe(cFromNeg);
		expect(cFromPos).toBe(cFromBeyond);
	});

	/** */
	test.skip(".visitDescendents()", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(T.outdent`
			
		`);
	});
});
