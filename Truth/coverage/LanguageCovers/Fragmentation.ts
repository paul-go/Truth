
namespace Truth
{
	/**
	 * This example demonstrates fragmented types
	 */
	function coverLanguageFragmentation()
	{
		return new FullCover().try(`
			
			A, B, C
			
			Class
				Property : A
				Property : B
				Property : C
			
			SubClass : Class
				Property ~ A, B, C
		`);
	}
}
