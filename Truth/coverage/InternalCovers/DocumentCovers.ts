
namespace Truth
{
	function coverGetAncestryWithStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
				B
					C
						D
							E
		`);
		
		const ancestryAtA = Not.null(doc.getAncestry(doc.read(0)));
		const ancestryAtB = Not.null(doc.getAncestry(doc.read(1)));
		const ancestryAtC = Not.null(doc.getAncestry(doc.read(2)));
		const ancestryAtD = Not.null(doc.getAncestry(doc.read(3)));
		const ancestryAtE = Not.null(doc.getAncestry(doc.read(4)));
		
		return [
			() => hasContent(ancestryAtA, ""),
			() => hasContent(ancestryAtB, `
				A
			`),
			() => hasContent(ancestryAtC, `
				A
				B
			`),
			() => hasContent(ancestryAtD, `
				A
				B
				C
			`),
			() => hasContent(ancestryAtE, `
				A
				B
				C
				D
			`)
		];
	}
	
	function coverGetAncestryWithNumber()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
				B
					C
						D
							E
		`);
		
		const ancestry = doc.getAncestry(3);
		
		return [
			() => hasContent(ancestry, `
				A
				B
				C
			`)
		];
	}

	function coverGetParentWithStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
				B
					C
		`);
		
		const smtA = doc.read(0);
		const smtB = doc.read(1);
		const smtC = doc.read(2);
		const smtBParent = doc.getParent(smtB);
		const smtCParent = doc.getParent(smtC);
		
		return [
			() => smtBParent === smtA,
			() => smtCParent === smtB
		];
	}

	function coverGetParentWithNumber()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
				B
					C
		`);
		
		const smtA = doc.read(0);
		const smtBParent = doc.getParent(1);
		
		return [
			() => smtBParent === smtA
		];
	}

	function coverGetParentWithTopLevelStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
			// 
			B
			//
			C
		`);
		
		const parentA = doc.getParent(0);
		const parentB = doc.getParent(2);
		const parentC = doc.getParent(4);
		
		return [
			() => parentA === doc,
			() => parentB === doc,
			() => parentC === doc
		];
	}

	function coverGetParentFromPositionWithEmptyDocument()
	{
		const prog = new Program();
		const doc = prog.documents.create("");
		
		const parent = doc.getParentFromPosition(0, 0);
		
		return [
			() => parent === doc
		];
	}

	function coverGetParentFromPositionOnEmptyLine()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
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
		
		return [
			() => parentAt1 === a,
			() => parentAt2 === b,
			() => parentAt3 === c,
			() => parentAt4 === d
		];
	}

	function coverGetParentFromPositionOnNonEmptyLine()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
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
		
		return [
			() => parentOfB === a,
			() => parentOfC === b,
			() => parentOfD === c
		];
	}
	
	function coverGetParentFromPositionReturningContainingDocument()
	{
		const prog = new Program();
		const doc = prog.documents.create(`
			A
				B
					C
						D
		`);
		
		const container = doc.getParentFromPosition(3, 0);
		return [
			() => container === doc
		];
	}
	
	function coverGetSiblingsOnTopLevelStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
					A
				B
			C
				D
					E
		`);
		
		const c = doc.read(2);
		const siblings = doc.getSiblings(c);
		
		return () => hasContent(siblings, outdent`
			A
			B
			C
		`);
	}
	
	function coverGetSiblingsOnNestedStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
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
		
		return () => hasContent(siblings, outdent`
			B
			C
			F
		`);
	}
	
	function coverGetSiblingsOnTopLevelNoopStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
			//
			B
		`);
		
		const cmt = doc.read(1);
		const siblings = doc.getSiblings(cmt);
		
		return () => siblings === null;
	}
	
	function coverGetSiblingsOnNestedNoopStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
				B
				//
				//
				//
				C
			D
		`);
		
		const siblings = doc.getSiblings(3);
		return () => siblings === null;
	}
	
	function coverGetChildrenOnEmptyDocument()
	{
		const prog = new Program();
		const doc = prog.documents.create("\t".repeat(5));
		const children = doc.getChildren();
		
		return () => hasContent(children, "");
	}
	
	function coverGetChildrenOnNonEmptyDocument()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
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
		
		const smtA = doc.read(0);
		const smtB = doc.read(1);
		const smtC = doc.read(8);
		const smtD = doc.read(9);
		const smtE = doc.read(10);
		const children = doc.getChildren(smtA);
		
		return () => children.join() === [smtB, smtC, smtD, smtE].join();
	}
	
	function coverGetChildrenOnTopLevelStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverGetChildrenOnNestedStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverGetChildrenOnNestedNoopStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverHasDescendents()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverHasDescendentsOnNonEmptyDocument()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverHasDescendentsOnTopLevelStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverHasDescendentsOnNestedStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverHasDescendentsOnNestedNoopStatement()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverHasDescendentsOnStatementAtNumericPosition()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverGetStatementIndex()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			
		`);
	}
	
	function coverGetNotes()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
				// **
				// **
				B
		`);
		
		const notes = doc.getNotes(3);
		return () => notes.join() === ["**", "**"].join();
	}
	
	function coverGetNotesWhenNoneAvailable()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
			B
		`);
		
		const notes = doc.getNotes(2).join("");
		
		return [
			() => notes === ""
		];
	}
	
	function coverGetNotesOnCommentLine()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			// ***
			// ***
		`);
		
		const notes = doc.getNotes(1).join("");
		
		return [
			() => notes === ""
		];
	}
	
	function coverReadOnLineFromPossiblePositions()
	{
		const prog = new Program();
		const doc = prog.documents.create(outdent`
			A
			B
			C
		`);
		
		const aFromZero = doc.read(0);
		const aFromNegative = doc.read(-3);
		() => aFromZero === aFromNegative
		
		const cFromPos = doc.read(2);
		const cFromNeg = doc.read(-1);
		const cFromBeyond = doc.read(3);
		
		return [
			() => cFromPos === cFromNeg,
			() => cFromPos === cFromBeyond
		];
	}
}
