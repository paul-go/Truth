
namespace Cover
{
	/**
	 * This example demonstrates fragmented Types.
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
		
		const [tA, tB, tC, tClassProperty] = typesOf(doc, "A", "B", "C", ["Class", "Property"]);
		return [
			() => tClassProperty.is(tA),
			() => tClassProperty.is(tB),
			() => tClassProperty.is(tC)
		];
	}
}
