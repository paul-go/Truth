
namespace Backer.Tests
{	
	async function coverIfTruthCompiles()
	{
		const doc = await Truth.parse(
`
${Util.Headers}

Product
	Name: string
	Count: number
	
001: Product
	Name: "Prd1"
	Count: 4

002: Product
	Name: "Prd2"
	Count: 10
`);
		doc.program.verify();
		
		const faults = Array.from(doc.program.faults.each());
		
		return ["A stupid error", () => false, () => faults.length === 0];
	}
	
	async function coverLoadTruthWorks()
	{
		console.log("123");
		console.log("123");
		console.log("123");
		console.log("123");
		console.log("123");
		console.log("123");
		console.log("123");
		console.log("123");
		console.log("123");
	}
}