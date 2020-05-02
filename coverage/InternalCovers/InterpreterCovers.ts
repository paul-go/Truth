
namespace CoverTruth
{
	/** */
	export async function coverBasicInterpreter()
	{
		const doc = await createDocument(`
			number
			/\\d+ : number
			Class
				field : number
		`);
		
		const program = doc.program;
		program.check();
		
		const [faults, vdoc] = program.interpret(`
			C1 : Class
				field : 1
			C2 : Class
				field : 2
		`);
		
		const types = Array.from(vdoc.eachType());
		return [
			() => faults.length === 0,
			() => types.length === 2
		];
	}
}

if (typeof module === "object")
	module.exports = { CoverTruth };
