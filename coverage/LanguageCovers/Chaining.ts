
namespace CoverTruth
{
	/**
	 * This example demonstrates declaration-side chaining
	 * of multiple Facts, and applying a single annotation to all Facts.
	 */
	async function coverLanguageChaining()
	{
		const [doc] = await createLanguageCover(`
			fact
			a, b, c : fact
			
			container
				a
				b
				c
		`);
		
		const [fact, a, b, c] = factsOf(doc, 
			"fact",
			["container", "a"],
			["container", "b"],
			["container", "c"]);
		
		return [
			() => a.is(fact),
			() => b.is(fact),
			() => c.is(fact)
		];
	}
}
