
namespace Truth
{
	async function coverProgramQuery()
	{
		const program = new Program();
		const doc = await program.addDocument(outdent`
			A
			B : A
			C : B
		`);
		
		if (doc instanceof Error)
		{
			debugger;
			return;
		}
		
		await doc.edit(mutator =>
		{
			mutator.insert("", 3);
		});
		
		const typeC = doc.query("C");
		return () => typeC instanceof Type;
	}
}
