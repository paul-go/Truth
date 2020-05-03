
namespace CoverTruth
{
	/** */
	export async function coverFactApiExplicitStatements()
	{
		const [doc, program] = await createLanguageCover(`
			Class
				Field
				Field
		`);
		
		const targetFact = program.queryDocument(doc, "Class", "Field");
		const targetStatements = targetFact instanceof Truth.Fact ?
			targetFact.statements :
			[];
		
		return [
			() => targetFact instanceof Truth.Fact,
			() => targetStatements.length === 2,
			() => targetStatements[0] === doc.read(1),
			() => targetStatements[0] === doc.read(2)
		];
	}
	
	/** */
	export async function coverFactApiImplicitStatements()
	{
		const [doc, program] = await createLanguageCover(`
			Class
				Field
			SubClass : Class
		`);
		
		const targetFact = program.queryDocument(doc, "SubClass", "Field");
		const targetStatements = targetFact instanceof Truth.Fact ?
			targetFact.statements :
			[];
		
		return [
			() => targetFact instanceof Truth.Fact,
			() => targetStatements.length === 0
		];
	}
}
