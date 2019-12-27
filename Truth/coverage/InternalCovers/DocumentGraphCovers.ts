
namespace Truth
{
	function coverBasicLinking()
	{
		const cover = new FullCover();
		
		const uri1 = cover.createFakeUri();
		const uri2 = cover.createFakeUri();
		const uri3 = cover.createFakeUri();
		
		cover.add(`
			Doc1
		`);
		
		cover.add(`
			${uri1}
			Doc2
		`);
		
		cover.add(`
			${uri2}
			Doc3
			Doc3
		`);
		
		cover.try();
		const documentGraphText = cover.program.documents.toString();
		
		return () => documentGraphText === outdent`
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
		`;
	}
	
	function coverBasicUnlinking()
	{
		const cover = new FullCover();
		
		const uri1 = cover.add(outdent`
			Doc1
		`);
		
		const uri2 = cover.add(outdent`
			${uri1}
			Doc2
		`);
		
		const uri3 = cover.add(outdent`
			${uri2}
		`);
		
		cover.try();
		cover.program.documents.delete(Uri.maybeParse(uri3)!);
		
		const documentGraphText = cover.program.documents.toString();
		const documentGraphTextExpected = outdent`
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
		
		return () => documentGraphText === documentGraphTextExpected;
	}
	
	function coverMultipleReferencesTheSameDocument()
	{
		const cover = new FullCover();
		const uri1 = cover.add("A");
		const uri2 = cover.add(uri1);
		const uri3 = cover.add(uri1);
		
		cover.try();
		
		const documentGraphText = cover.program.documents.toString();
		const documentGraphTextExpected = outdent`
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
		
		return () => documentGraphText === documentGraphTextExpected;
	}
	
	function coverCircularLinkingFault()
	{
		const cover = new FullCover();
		const program = cover.program;
		const uri1 = cover.createFakeUri();
		const uri2 = cover.createFakeUri();
		cover.add(uri2);
		cover.add(uri1);
		cover.try();
		
		return [
			() => program.faults.count === 1,
			() => hasFault(program, Faults.CircularResourceReference.code, 0)
		];
	}
	
	//
	function coverRecoveryOnFaultyLinkRemoval()
	{
		const cover = new FullCover();
		const program = cover.program;
		const uri1 = cover.createFakeUri();
		const uri2 = cover.createFakeUri();
		cover.add(uri2);
		cover.add(uri1);
		cover.try();
		
		const doc2 = cover.program.documents.get(uri2)!;
		
		doc2.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		return () => program.faults.count === 0;
	}
}
