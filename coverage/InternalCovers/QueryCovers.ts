
namespace Truth
{
	async function coverProgramQuery()
	{
		const [doc] = await createLanguageCover(`
			a
			b : a
			c : b
		`);
		
		await doc.edit(mutator =>
		{
			mutator.insert("", 3);
		});
		
		const c = doc.query("c");
		return () => c instanceof Type;
	}
}
