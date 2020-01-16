
namespace Truth
{
	async function coverGetAncestryWithStatement()
	{
		const [doc] = await createLanguageCover(`
			A
				B
					C
						D
							E
		`);
		
		const ancestryAtA = Not.null(doc.getAncestry(doc.read(1)));
		const ancestryAtB = Not.null(doc.getAncestry(doc.read(2)));
		const ancestryAtC = Not.null(doc.getAncestry(doc.read(3)));
		const ancestryAtD = Not.null(doc.getAncestry(doc.read(4)));
		const ancestryAtE = Not.null(doc.getAncestry(doc.read(5)));
		
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
		const [doc] = await createLanguageCover(`
			A
				B
					C
						D
							E
		`);
		
		const ancestry = doc.getAncestry(4);
		
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
		const [doc] = await createLanguageCover(`
			A
				B
					C
		`);
		
		const smtA = doc.read(1);
		const smtB = doc.read(2);
		const smtC = doc.read(3);
		const smtBParent = doc.getParent(smtB);
		const smtCParent = doc.getParent(smtC);
		
		return [
			() => smtBParent === smtA,
			() => smtCParent === smtB
		];
	}

	async function coverGetParentWithNumber()
	{
		const [doc] = await createLanguageCover(`
			A
				B
					C
		`);
		
		const smtA = doc.read(1);
		const smtBParent = doc.getParent(2);
		
		return [
			() => smtBParent === smtA
		];
	}

	async function coverGetParentWithTopLevelStatement()
	{
		const [doc] = await createLanguageCover(`
			A
			// 
			B
			//
			C
		`);
		
		const parentA = doc.getParent(1);
		const parentB = doc.getParent(3);
		const parentC = doc.getParent(5);
		
		return [
			() => parentA === doc,
			() => parentB === doc,
			() => parentC === doc
		];
	}

	async function coverGetParentFromPositionWithEmptyDocument()
	{
		const [doc] = await createLanguageCover("");
		const parent = doc.getParentFromPosition(1, 0);
		
		return [
			() => parent === doc
		];
	}

	async function coverGetParentFromPositionOnEmptyLine()
	{
		const [doc] = await createLanguageCover(`
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
	
	async function coverGetParentFromPositionOnNonEmptyLine()
	{
		const [doc] = await createLanguageCover(`
			A
				B
					C
						D
		`);
		
		const a = doc.read(1);
		const b = doc.read(2);
		const c = doc.read(3);
		
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
		const [doc] = await createLanguageCover(`
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
	
	async function coverGetSiblingsOnTopLevelStatement()
	{
		const [doc] = await createLanguageCover(`
					A
				B
			C
				D
					E
		`);
		
		const c = doc.read(3);
		const siblings = doc.getSiblings(c);
		
		return () => hasContent(siblings, outdent`
			A
			B
			C
		`);
	}
	
	async function coverGetSiblingsOnNestedStatement()
	{
		const [doc] = await createLanguageCover(`
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
		
		const c = doc.read(5);
		const siblings = doc.getSiblings(c);
		
		return () => hasContent(siblings, outdent`
			B
			C
			F
		`);
	}
	
	async function coverGetSiblingsOnTopLevelNoopStatement()
	{
		const [doc] = await createLanguageCover(`
			A
			//
			B
		`);
		
		const cmt = doc.read(2);
		const siblings = doc.getSiblings(cmt);
		
		return () => siblings === null;
	}
	
	async function coverGetSiblingsOnNestedNoopStatement()
	{
		const [doc] = await createLanguageCover(`
			A
				B
				//
				//
				//
				C
			D
		`);
		
		const siblings = doc.getSiblings(4);
		return () => siblings === null;
	}
	
	async function coverGetChildrenOnEmptyDocument()
	{
		const [doc] = await createLanguageCover("\t".repeat(5));
		const children = doc.getChildren();
		return () => hasContent(children, "");
	}
	
	async function coverGetChildrenOnNonEmptyDocument()
	{
		const [doc] = await createLanguageCover(`
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
		
		const smtA = doc.read(1);
		const smtB = doc.read(2);
		const smtC = doc.read(9);
		const smtD = doc.read(10);
		const smtE = doc.read(11);
		const children = doc.getChildren(smtA);
		
		return [
			() => children[0] === smtB,
			() => children[1] === smtC,
			() => children[2] === smtD,
			() => children[3] === smtE,
		]
	}
	
	async function coverGetChildrenOnTopLevelStatement()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverGetChildrenOnNestedStatement()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverGetChildrenOnNestedNoopStatement()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverHasDescendents()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverHasDescendentsOnNonEmptyDocument()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverHasDescendentsOnTopLevelStatement()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverHasDescendentsOnNestedStatement()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverHasDescendentsOnNestedNoopStatement()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverHasDescendentsOnStatementAtNumericPosition()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverGetStatementIndex()
	{
		const [doc] = await createLanguageCover(`
			
		`);
	}
	
	async function coverGetNotes()
	{
		const [doc] = await createLanguageCover(`
			A
				// **
				// **
				B
		`);
		
		const notes = doc.getNotes(3);
		return () => notes.join() === ["**", "**"].join();
	}
	
	async function coverGetNotesWhenNoneAvailable()
	{
		const [doc] = await createLanguageCover(`
			A
			B
		`);
		
		const notes = doc.getNotes(2).join("");
		
		return [
			() => notes === ""
		];
	}
	
	async function coverGetNotesOnCommentLine()
	{
		const [doc] = await createLanguageCover(`
			// ***
			// ***
		`);
		
		const notes = doc.getNotes(1).join("");
		
		return [
			() => notes === ""
		];
	}
	
	async function coverReadOnLineFromPossiblePositions()
	{
		const [doc] = await createLanguageCover(`
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
