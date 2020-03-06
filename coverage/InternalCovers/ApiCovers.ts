
namespace Truth
{
	export async function coverTypeApiExplicitStatements()
	{
		const [doc, program] = await createLanguageCover(`
			Class
				Field
				Field
		`);
		
		const targetType = program.query(doc, "Class", "Field");
		const targetStatements = targetType instanceof Type ?
			targetType.statements :
			[];
		
		return [
			() => targetType instanceof Type,
			() => targetStatements.length === 2,
			() => targetStatements[0] === doc.read(1),
			() => targetStatements[0] === doc.read(2)
		];
	}
	
	export async function coverTypeApiImplicitStatements()
	{
		const [doc, program] = await createLanguageCover(`
			Class
				Field
			SubClass : Class
		`);
		
		const targetType = program.query(doc, "SubClass", "Field");
		const targetStatements = targetType instanceof Type ?
			targetType.statements :
			[];
		
		return [
			() => targetType instanceof Type,
			() => targetStatements.length === 0
		];
	}
}
