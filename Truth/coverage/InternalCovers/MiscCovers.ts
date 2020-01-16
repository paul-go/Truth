
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
}
