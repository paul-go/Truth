
namespace Truth
{
	async function coverSimpleTypeCheck()
	{
		const [doc, program] = await createLanguageCover(`
			word
			/[A-Z]{3} : word
			
			number
			/\d+ : number
			
			struct
				w : word
				n : number
			
			s1 : struct
				w : ABC
				n : CBA
			
			s2 : struct
				w : XYZ
				n : 123
		`);
		
		const [struct, s1w, s1n, s2w, s2n] = typesOf(doc,
			"struct",
			["s1", "w"],
			["s1", "n"],
			["s2", "w"],
			["s2", "n"]
		);
		
		const isInerrant = program.verify();
		
		for (const fault of program.faults.each())
			console.log(fault.toString());
		
		return [
			() => isInerrant,
			() => s1w.value === "ABC",
		];
	}
}
