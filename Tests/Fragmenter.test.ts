import * as X from "../Core/X";
import * as U from "./TestUtil";
import "./TestExtensions";


//
describe("Fragmenter Tests", () =>
{
	//
	test("1-Level + No Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A, B
		`);
		
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
				B (2)
			
			A => (1)
			B => (2)
		`);
	});

	//
	test("2-Level + No Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A, B
				C, D
		`);
		
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
					C (2)
					D (3)
				B (4)
					C (5)
					D (6)
			
			A => (1)
			B => (4)
			C => (2, 5)
			D => (3, 6)
		`);
	});

	//
	test("3-Level + No Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A, B
				C, D
					E, F
		`);
		
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
					C (2)
						E (3)
						F (4)
					D (5)
						E (6)
						F (7)
				B (8)
					C (9)
						E (10)
						F (11)
					D (12)
						E (13)
						F (14)
			
			A => (1)
			B => (8)
			C => (2, 9)
			D => (5, 12)
			E => (3, 6, 10, 13)
			F => (4, 7, 11, 14)
		`);
	});
	
	//
	test("1-Level + Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A, A
			A, A
		`);
		
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
				A (2)
				A (3)
				A (4)
			
			A => (1)
			A => (2)
			A => (3)
			A => (4)
		`);
	});
	
	//
	test("2-Level + Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
				B, C
			A
				B, C
		`);
		
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
					B (2)
					C (3)
				A (4)
					B (5)
					C (6)
			
			A => (1)
			B => (2)
			C => (3)
			A => (4)
			B => (5)
			C => (6)
		`);
	});
	
	//
	test("2-Level + Fragmentation + Top-Level Group", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A, B
				C, D
			A, B
				C, D
		`);
		
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
					C (2)
					D (3)
				A (4)
					C (5)
					D (6)
				B (7)
					C (8)
					D (9)
				B (10)
					C (11)
					D (12)
			
			A => (1)
			B => (7)
			C => (2, 8)
			D => (3, 9)
			A => (4)
			B => (10)
			C => (5, 11)
			D => (6, 12)
		`);
	});
	
	//
	test("4-level + Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
				B, C
					D, E
						F
						G
				B, C
					D, E
						F
						G
			H
		`);
		
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
					B (2)
						D (3)
							F (4)
							G (5)
						E (6)
							F (7)
							G (8)
					B (9)
						D (10)
							F (11)
							G (12)
						E (13)
							F (14)
							G (15)
					C (16)
						D (17)
							F (18)
							G (19)
						E (20)
							F (21)
							G (22)
					C (23)
						D (24)
							F (25)
							G (26)
						E (27)
							F (28)
							G (29)
				H (30)
			
			A => (1)
			B => (2)
			C => (16)
			D => (3, 17)
			E => (6, 20)
			F => (4, 7, 18, 21)
			G => (5, 8, 19, 22)
			B => (9)
			C => (23)
			D => (10, 24)
			E => (13, 27)
			F => (11, 14, 25, 28)
			G => (12, 15, 26, 29)
			H => (30)
		`);
	});
	
	//
	test("Simple Invalidation +  Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A
				B
					C
		`);
		
		const b = doc.read(1);
		const param = new X.InvalidateParam(doc, [b], [1]);
		prog.hooks.Invalidate.run(param);
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
			
			A => (1)
		`);
	});
	
	//
	test("Simple Invalidation + Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A, B
				C, D
			A, B
				C, D
		`);
		
		const cd = doc.read(1);
		const param = new X.InvalidateParam(doc, [cd], [1]);
		prog.hooks.Invalidate.run(param);
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
				A (2)
					C (3)
					D (4)
				B (5)
				B (6)
					C (7)
					D (8)
			
			A => (1)
			B => (5)
			A => (2)
			B => (6)
			C => (3, 7)
			D => (4, 8)
		`);
	});
	
	//
	test ("Complex Invalidation + Fragmentation", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A, B
				// The following C, D statement will be
				// invalidated, elimintating all X's.
				C, D
					X
					X
						X
						X
					X
						X
						X
							X
							X
				C, D
		`);
		
		const cd = doc.read(3);
		const param = new X.InvalidateParam(doc, [cd], [3]);
		prog.hooks.Invalidate.run(param);
		const fragContent = prog.fragmenter.toString();
		
		expect(fragContent).toBe(U.outdent`
			${doc.sourceUri.toString()}
				A (1)
					C (2)
					D (3)
				B (4)
					C (5)
					D (6)
			
			A => (1)
			B => (4)
			C => (2, 5)
			D => (3, 6)
		`);
	});
	
	//
	test("Fragmenter Query", () =>
	{
		const prog = new X.Program();
		const doc = prog.documents.create(U.outdent`
			A : 1
				B : 2
					C : 3
					C : 4
				B : 5
					C : 6
					C : 7
		`);
		
		const extUri = doc.sourceUri.extend([], ["A", "B", "C"]);
		
		const queryResult = prog.fragmenter.query(extUri)!;
		expect(queryResult).toBeTruthy();
		
		const statements: X.Statement[] = [];
		
		for (const molecule of queryResult.molecules)
			for (const ptr of molecule.localAtom.pointers)
				statements.push(ptr.statement);
		
		expect(statements).toRead(U.outdent`
			C : 3
			C : 4
			C : 6
			C : 7
		`);
	});
});