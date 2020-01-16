
namespace Truth
{
	/**
	 * This example demonstrates a fault being generated
	 * as a result of an attempt at circular inheritance, but
	 * done in a way that transcends multiple levels of 
	 * abstraction through the use of entanglements.
	 */
	async function coverEntanglementCircularInheritance()
	{
		const [doc] = await createLanguageCover(`
			Thing
			
			Class
				Property : Thing
				Field : Property
				
			SubClass : Class
				Field
				Property : Field #203;
		`);
		
		return [
			() => true // ??	
		];
	}
	
	async function coverFiles()
	{
		const [doc1, doc2] = await createLanguageCover(`
			A
			B : A
		`, `
			./1.truth
			C : B
			D
		`);
		
		const [tA] = typesOf(doc1, "A");
		const [tC] = typesOf(doc2, "C");
		
		return [
			() => !doc1.hasFaults(),
			() => !doc2.hasFaults(),
			() => tC.is(tA)
		];
	}
	
	async function coverStatementWithUri()
	{
		const program = new Program();
		const document = await program.addDocumentFromUri("./file.truth");
		if (document instanceof Error)
			return document;
		
		const statement = document.read(0);
		const uri = statement.uri;
		return () => uri instanceof KnownUri;
	}
}
