
namespace Cover
{
	/** */
	export async function coverTypeApiExplicitStatements()
	{
		const [doc, program] = await createLanguageCover(`
			Class
				Field
				Field
		`);
		
		const targetType = asType(program.queryDocument(doc, "Class", "Field"));
		const targetStatements = targetType instanceof Truth.Type ?
			targetType.statements :
			[];
		
		return [
			() => targetStatements.length === 2,
			() => targetStatements[0] === doc.read(1),
			() => targetStatements[0] === doc.read(2)
		];
	}
	
	/** */
	export async function coverTypeApiImplicitStatements()
	{
		const [doc, program] = await createLanguageCover(`
			Class
				Field
			SubClass : Class
		`);
		
		const targetType = program.queryDocument(doc, "SubClass", "Field");
		const targetStatements = targetType instanceof Truth.Type ?
			targetType.statements :
			[];
		
		return [
			() => targetType instanceof Truth.Type,
			() => targetStatements.length === 0
		];
	}
	
	/** */
	export async function coverTypeApiListExtrinsic()
	{
		const [doc, program] = await createLanguageCover(`
			A
			B : A...
			C : B
		`);
		
		const typeA = asType(program.queryDocument(doc, "A"));
		const typeB = asType(program.queryDocument(doc, "B"));
		const typeC = asType(program.queryDocument(doc, "C"));
		
		return [
			() => !typeA.isListExtrinsic,
			() => typeB.isListExtrinsic,
			() => typeC.isListExtrinsic
		];
	}
}
