
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
	
	function coverFiles()
	{
		const cover = new FullCover();
		
		const file1 = cover.add(`
			A
			B : A
		`);
		
		cover.add(`
			${file1}
			C : B
		`);
		
		return cover.try();
	}
}
