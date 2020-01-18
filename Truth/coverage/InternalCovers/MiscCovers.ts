
namespace Truth
{
	async function coverSimpleTypeCheck()
	{
		const [doc, program] = await createLanguageCover(`
			word
			/[A-Z]{3} : word
			
			struct
				a : word
				b : word
			
			s1 : struct
				a : ABC
				b : CBA
			
			s2 : struct
				a : XYZ
				b : ZYX
		`);
		
		const [struct, s1a, s2a] = typesOf(doc,
			"struct",
			["s1", "a"],
			["s2", "a"]
		);
		
		const isInerrant = program.verify();
		
		for (const fault of program.faults.each())
			console.log(fault.toString());
		
		return [
			() => isInerrant,
			() => s1a.value === "ABC",
		];
	}
}
