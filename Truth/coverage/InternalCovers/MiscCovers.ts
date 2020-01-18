
namespace Truth
{
	async function coverSimpleTypeCheck()
	{
		const [doc, program] = await createLanguageCover(`
			number
			/\\d+ : number
			decimal : number
			struct
				n : number
			s1 : struct
				n : 1
		`);
		
		const [s1n] = typesOf(doc,
			["s1", "n"]
		);
		
		const isInerrant = program.verify();
		
		for (const fault of program.faults.each())
			console.log(fault.toString());
		
		console.log(doc.toString(true));
		
		return [
			() => isInerrant,
			() => s1n.value === "123"
		];
	}
	
	async function coverThirdLevelValue()
	{
		const [doc, program] = await createLanguageCover(`
			number
			/\\d+ : number
			decimal : number
			struct
				n
					min : number
			s1 : struct
				n
					min : 3
		`);
		
		const [s1n] = typesOf(doc,
			["s1", "n", "min"]
		);
		
		const isInerrant = program.verify();
		
		for (const fault of program.faults.each())
			console.log(fault.toString());
		
		return [
			() => isInerrant,
			() => s1n.value === "3"
		];		
	}
}
