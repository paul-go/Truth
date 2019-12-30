
namespace Truth
{
	async function coverGetAncestryWithStatement()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
						D
							E
		`);
		
		if (doc instanceof Error)
			throw doc;
		
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
	
	async function coverGetAncestryWithNumber()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
						D
							E
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const ancestry = doc.getAncestry(3);
		
		return [
			() => hasContent(ancestry, `
				A
				B
				C
			`)
		];
	}

	async function coverGetParentWithStatement()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
		`);
		
		if (doc instanceof Error)
			throw doc;
		
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

	async function coverGetParentWithNumber()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const smtA = doc.read(0);
		const smtBParent = doc.getParent(1);
		
		return [
			() => smtBParent === smtA
		];
	}

	async function coverGetParentWithTopLevelStatement()
	{
		const doc = await Truth.parse(outdent`
			A
			// 
			B
			//
			C
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const parentA = doc.getParent(0);
		const parentB = doc.getParent(2);
		const parentC = doc.getParent(4);
		
		return [
			() => parentA === doc,
			() => parentB === doc,
			() => parentC === doc
		];
	}

	async function coverGetParentFromPositionWithEmptyDocument()
	{
		const doc = await Truth.parse("");
		if (doc instanceof Error)
			throw doc;
		
		const parent = doc.getParentFromPosition(0, 0);
		
		return [
			() => parent === doc
		];
	}

	async function coverGetParentFromPositionOnEmptyLine()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
						D
							
				E
					F
		`);
		
		if (doc instanceof Error)
			throw doc;
		
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
	
	async function coverGetParentFromPositionOnNonEmptyLine()
	{
		const doc = await Truth.parse(outdent`
			A
				B
					C
						D
		`);
		
		if (doc instanceof Error)
			throw doc;
		
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
	
	async function coverGetParentFromPositionReturningContainingDocument()
	{
		const doc = await Truth.parse(`
			A
				B
					C
						D
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const container = doc.getParentFromPosition(3, 0);
		return [
			() => container === doc
		];
	}
	
	async function coverGetSiblingsOnTopLevelStatement()
	{
		const doc = await Truth.parse(outdent`
					A
				B
			C
				D
					E
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const c = doc.read(2);
		const siblings = doc.getSiblings(c);
		
		return () => hasContent(siblings, outdent`
			A
			B
			C
		`);
	}
	
	async function coverGetSiblingsOnNestedStatement()
	{
		const doc = await Truth.parse(outdent`
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
		
		if (doc instanceof Error)
			throw doc;
		
		const c = doc.read(4);
		const siblings = doc.getSiblings(c);
		
		return () => hasContent(siblings, outdent`
			B
			C
			F
		`);
	}
	
	async function coverGetSiblingsOnTopLevelNoopStatement()
	{
		const doc = await Truth.parse(outdent`
			A
			//
			B
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const cmt = doc.read(1);
		const siblings = doc.getSiblings(cmt);
		
		return () => siblings === null;
	}
	
	async function coverGetSiblingsOnNestedNoopStatement()
	{
		const doc = await Truth.parse(outdent`
			A
				B
				//
				//
				//
				C
			D
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const siblings = doc.getSiblings(3);
		return () => siblings === null;
	}
	
	async function coverGetChildrenOnEmptyDocument()
	{
		const doc = await Truth.parse("\t".repeat(5));
		if (doc instanceof Error)
			throw doc;
		
		const children = doc.getChildren();
		return () => hasContent(children, "");
	}
	
	async function coverGetChildrenOnNonEmptyDocument()
	{
		const doc = await Truth.parse(outdent`
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
		
		if (doc instanceof Error)
			throw doc;
		
		const smtA = doc.read(0);
		const smtB = doc.read(1);
		const smtC = doc.read(8);
		const smtD = doc.read(9);
		const smtE = doc.read(10);
		const children = doc.getChildren(smtA);
		
		return () => children.join() === [smtB, smtC, smtD, smtE].join();
	}
	
	async function coverGetChildrenOnTopLevelStatement()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverGetChildrenOnNestedStatement()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverGetChildrenOnNestedNoopStatement()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverHasDescendents()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverHasDescendentsOnNonEmptyDocument()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverHasDescendentsOnTopLevelStatement()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverHasDescendentsOnNestedStatement()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverHasDescendentsOnNestedNoopStatement()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverHasDescendentsOnStatementAtNumericPosition()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverGetStatementIndex()
	{
		const doc = await Truth.parse(outdent`
			
		`);
	}
	
	async function coverGetNotes()
	{
		const doc = await Truth.parse(outdent`
			A
				// **
				// **
				B
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const notes = doc.getNotes(3);
		return () => notes.join() === ["**", "**"].join();
	}
	
	async function coverGetNotesWhenNoneAvailable()
	{
		const doc = await Truth.parse(outdent`
			A
			B
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const notes = doc.getNotes(2).join("");
		
		return [
			() => notes === ""
		];
	}
	
	async function coverGetNotesOnCommentLine()
	{
		const doc = await Truth.parse(outdent`
			// ***
			// ***
		`);
		
		if (doc instanceof Error)
			throw doc;
		
		const notes = doc.getNotes(1).join("");
		
		return [
			() => notes === ""
		];
	}
	
	async function coverReadOnLineFromPossiblePositions()
	{
		const doc = await Truth.parse(outdent`
			A
			B
			C
		`);
		
		if (doc instanceof Error)
			throw doc;
		
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
