
namespace CoverTruth
{
	/**
	 * This example demonstrates fragmented Facts.
	 */
	export async function coverLanguageFragmentation()
	{
		const [doc] = await createLanguageCover(`
			A, B, C
			
			Class
				Property : A
				Property : B
				Property : C
			
			SubClass : Class
				Property
		`);
		
		const [tA, tB, tC, tClassProperty] = factsOf(doc, "A", "B", "C", ["Class", "Property"]);
		return [
			() => tClassProperty.is(tA),
			() => tClassProperty.is(tB),
			() => tClassProperty.is(tC)
		];
	}
}
