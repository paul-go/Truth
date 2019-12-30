
namespace Truth
{
	/**
	 * This example demonstrates a fault being generated
	 * as a result of an attempt at circular inheritance, but
	 * done in a way that transcends multiple levels of 
	 * abstraction through the use of entanglements.
	 */
	function coverEntanglementCircularInheritance()
	{
		const cover = new FullCover();
		
		const result = cover.try(`
			Thing
			
			Class
				// How is this not a circular reference right here?
				Property : Thing
				Field : Property
				
			SubClass : Class
				Field
				Property : Field #203;
		`);
		
		return result;
	}
	
	function coverSomething()
	{
		return new FullCover().try(`
			A : B
		`);
	}
	
	async function coverFiles()
	{
		const cover = new FullCover();
		
		const file1 = cover.add(`
			A
			B : A
		`);
		
		const file2 = cover.add(`
			${file1}
			C : B
			D
		`);
		
		const result = await cover.try();
		return result;
	}
	
	async function coverStatementWithUri()
	{
		const program = new Program();
		const document = await program.addDocumentFromUri("./file.truth");
		if (document instanceof Error)
			return document;
		
		const statement = document.read(0);
		const uri = statement.uri;
		return () => uri instanceof Uri;
	}
}
