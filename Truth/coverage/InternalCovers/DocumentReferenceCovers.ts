
namespace Truth
{
	async function coverTwoWayLink()
	{
		const program = new Program();
		const docA = await program.addDocument(outdent`
			A
		`);
		
		const docB = await program.addDocument(outdent`
			B
		`);
		
		if (docA instanceof Error || docB instanceof Error)
		{
			debugger;
			return;
		}
		
		await docB.edit((mutator: IDocumentMutator) =>
		{
			const uri = docA.sourceUri.toStoreString();
			mutator.insert(uri, 0);
		});
		
		return [
			() => docA.dependencies.length === 0,
			() => docA.dependents.length === 1,
			() => docB.dependencies.length === 1,
			() => docB.dependents.length === 0
		];
	}
	
	async function coverThreeWayLink()
	{
		const program = new Program();
		
		const docA = await program.addDocument(`
			DocA
		`);
		
		const docB = await program.addDocument(`
			DocB
		`);
		
		const docC = await program.addDocument(`
			DocC
		`);
		
		if (docA instanceof Error || docB instanceof Error || docC instanceof Error)
		{
			debugger;
			return;
		}
		
		const uri = docA.sourceUri.toStoreString();
		
		await docB.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert(uri, 0);
		});
		
		await docC.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert(uri, 0);
		});
		
		return [
			() => docA.dependencies.length === 0,
			() => docA.dependents.length === 2,
			() => docA.dependents[0] === docB,
			() => docA.dependents[1] === docC,
			
			() => docB.dependencies.length === 1,
			() => docB.dependencies[0] === docA,
			
			() => docC.dependencies.length === 1,
			() => docC.dependencies[0] === docA
		];
	}
	
	async function coverBasicUnlinking()
	{
		const program = new Program();
		const docA = await program.addDocument(outdent`
			A
		`);
		
		const docB = await program.addDocument(outdent`
			B
		`);
		
		if (docA instanceof Error || docB instanceof Error)
		{
			debugger;
			return;
		}
		
		await docB.edit((mutator: IDocumentMutator) =>
		{
			const uri = docA.sourceUri.toStoreString();
			mutator.insert(uri, 0);
		});
		
		await docB.edit((mutator: IDocumentMutator) =>
		{
			mutator.delete(0);
		});
		
		return [
			() => docA.dependencies.length === 0,
			() => docA.dependents.length === 0,
			() => docB.dependencies.length === 0,
			() => docB.dependents.length === 0
		];
	}
	
	async function coverCircular1WayLinkingFault()
	{
		const program = new Program();
		
		const docA = await program.addDocument(`
			DocA
		`);
		
		if (docA instanceof Error)
		{
			debugger;
			return;
		}
		
		const docAPath = docA.sourceUri.toStoreString();
		
		await docA.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert(docAPath, 0);
		});
		
		return [
			() => program.faults.hasOnly(
				[Faults.CircularResourceReference, docA, 1]
			),
			
			() => docA.dependencies.length === 1,
			() => docA.dependencies[0] === docA,
			() => docA.dependents.length === 1,
			() => docA.dependents[0] === docA
		];
	}
	
	async function coverCircular2WayLinkingFault()
	{
		const program = new Program();
		
		const docA = await program.addDocument(`
			DocA
		`);
		
		const docB = await program.addDocument(`
			DocB
		`);
		
		if (docA instanceof Error || docB instanceof Error)
		{
			debugger;
			return;
		}
		
		const docAPath = docA.sourceUri.toStoreString();
		const docBPath = docB.sourceUri.toStoreString();
		
		await docB.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert(docAPath, 0);
		});
		
		await docA.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert(docBPath, 0);
		});
		
		return [
			() => program.faults.hasOnly(
				[Faults.CircularResourceReference, docA, 1],
				[Faults.CircularResourceReference, docB, 1]
			),
			
			() => docA.dependencies.length === 1,
			() => docA.dependencies[0] === docB,
			() => docA.dependents.length === 1,
			() => docA.dependents[0] === docB,
			
			() => docB.dependencies.length === 1,
			() => docB.dependencies[0] === docA,
			() => docB.dependents.length === 1,
			() => docB.dependents[0] === docA
		];
	}
	
	async function coverCircular3WayLinkingFault()
	{
		const program = new Program();
		
		const docA = await program.addDocument(`
			DocA
		`);
		
		const docB = await program.addDocument(`
			DocB
		`);
		
		const docC = await program.addDocument(`
			DocC
		`);
		
		if (docA instanceof Error || docB instanceof Error || docC instanceof Error)
		{
			debugger;
			return;
		}
		
		const docAPath = docA.sourceUri.toStoreString();
		const docBPath = docB.sourceUri.toStoreString();
		const docCPath = docC.sourceUri.toStoreString();
		
		await docA.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert(docBPath, 0);
		});
		
		await docB.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert(docCPath, 0);
		});
		
		await docC.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert(docAPath, 0);
		});
		
		return [
			() => program.faults.hasOnly(
				[Faults.CircularResourceReference, docA, 1],
				[Faults.CircularResourceReference, docB, 1],
				[Faults.CircularResourceReference, docC, 1]
			),
			
			() => docA.dependencies.length === 1,
			() => docA.dependents.length === 1,
			() => docA.dependencies[0] === docB,
			() => docA.dependents[0] === docC,
			
			() => docB.dependencies.length === 1,
			() => docB.dependents.length === 1,
			() => docB.dependencies[0] === docC,
			() => docB.dependents[0] === docA,
			
			() => docC.dependencies.length === 1,
			() => docC.dependents.length === 1,
			() => docC.dependencies[0] === docA,
			() => docC.dependents[0] === docB
		];
	}
	
	async function coverTraverseDependencies()
	{
		
	}
	
	async function coverTraverseDependenciesWithCircularFault()
	{
		
	}
	
	async function coverDuplicateResourceReferencesFault()
	{
		
	}
	
	async function coverDuplicateResourceReferencesRecovery()
	{
		
	}
	
	async function coverInsecureResourceReferencesFault()
	{
		
	}
	
	async function coverInsecureResourceReferencesRecovery()
	{
		
	}
	
	async function coverUnknownResourceReferencesFault()
	{
		
	}
	
	async function coverUnknownResourceReferencesRecovery()
	{
		
	}
}
