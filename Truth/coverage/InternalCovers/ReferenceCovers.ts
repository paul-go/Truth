
namespace Truth
{
	async function coverTwoWayLink()
	{
		const [doc1, doc2] = await createLanguageCover(
			"1",
			"2");
		
		await doc2.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./1.truth", 1);
		});
		
		return [
			() => doc1.dependencies.length === 0,
			() => doc1.dependents.length === 1,
			() => doc2.dependencies.length === 1,
			() => doc2.dependents.length === 0
		];
	}
	
	async function coverThreeWayLink()
	{
		const [doc1, doc2, doc3] = await createLanguageCover(
			"doc1",
			"doc2",
			"doc3"
		);
		
		await doc2.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./1.truth", 1);
		});
		
		await doc3.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./1.truth", 1);
		});
		
		return [
			() => doc1.dependencies.length === 0,
			() => doc1.dependents.length === 2,
			() => doc1.dependents[0] === doc2,
			() => doc1.dependents[1] === doc3,
			
			() => doc2.dependencies.length === 1,
			() => doc2.dependencies[0] === doc1,
			
			() => doc3.dependencies.length === 1,
			() => doc3.dependencies[0] === doc1
		];
	}
	
	async function coverBasicUnlinking()
	{
		const [doc1, doc2] = await createLanguageCover(
			"doc1",
			"doc2"
		);
		
		await doc2.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./1.truth", 1);
		});
		
		await doc2.edit((mutator: IDocumentMutator) =>
		{
			mutator.delete(0);
		});
		
		return [
			() => doc1.dependencies.length === 0,
			() => doc1.dependents.length === 0,
			() => doc2.dependencies.length === 0,
			() => doc2.dependents.length === 0
		];
	}
	
	async function coverCircular1WayLinkingFault()
	{
		const [doc1] = await createLanguageCover("doc1");
		
		await doc1.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./1.truth", 1);
		});
		
		return [
			() => doc1.hasFaults([Faults.CircularResourceReference, 1]),
			() => doc1.dependencies.length === 1,
			() => doc1.dependencies[0] === doc1,
			() => doc1.dependents.length === 1,
			() => doc1.dependents[0] === doc1
		];
	}
	
	async function coverCircular2WayLinkingFault()
	{
		const [doc1, doc2] = await createLanguageCover(
			"doc1",
			"doc2"
		);
		
		await doc2.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./1.truth", 1);
		});
		
		await doc1.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./2.truth", 1);
		});
		
		return [
			() => doc1.hasFaults([Faults.CircularResourceReference, 1]),
			() => doc2.hasFaults([Faults.CircularResourceReference, 1]),
			
			() => doc1.dependencies.length === 1,
			() => doc1.dependencies[0] === doc2,
			() => doc1.dependents.length === 1,
			() => doc1.dependents[0] === doc2,
			
			() => doc2.dependencies.length === 1,
			() => doc2.dependencies[0] === doc1,
			() => doc2.dependents.length === 1,
			() => doc2.dependents[0] === doc1
		];
	}
	
	async function coverCircular3WayLinkingFault()
	{
		const [doc1, doc2, doc3] = await createLanguageCover(
			"doc1",
			"doc2",
			"doc3"
		);
		
		await doc1.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./2.truth", 1);
		});
		
		await doc2.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./3.truth", 1);
		});
		
		await doc3.edit((mutator: IDocumentMutator) =>
		{
			mutator.insert("./1.truth", 1);
		});
		
		return [
			() => doc1.hasFaults([Faults.CircularResourceReference, 1]),
			() => doc2.hasFaults([Faults.CircularResourceReference, 1]),
			() => doc3.hasFaults([Faults.CircularResourceReference, 1]),
			
			() => doc1.dependencies.length === 1,
			() => doc1.dependents.length === 1,
			() => doc1.dependencies[0] === doc2,
			() => doc1.dependents[0] === doc3,
			
			() => doc2.dependencies.length === 1,
			() => doc2.dependents.length === 1,
			() => doc2.dependencies[0] === doc3,
			() => doc2.dependents[0] === doc1,
			
			() => doc3.dependencies.length === 1,
			() => doc3.dependents.length === 1,
			() => doc3.dependencies[0] === doc1,
			() => doc3.dependents[0] === doc2
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
