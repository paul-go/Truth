
namespace Truth
{
	async function coverSingleIndentationFault()
	{
		const program = new Program();
		const t = Syntax.tab;
		const s = Syntax.space;
		
		const lines = [
			"None",
			t + "Tab",
			s + "Space",
			t + s + "TabSpace"
		];
		
		program.addDocument(lines.join("\n"));
		
		return [
			() => hasFault(program, Faults.TabsAndSpaces.code, 3),
			() => program.faults.count === 1
		];
	}
	
	async function coverMultipleIndentationFault()
	{
		const program = new Program();
		const t = Syntax.tab;
		const s = Syntax.space;
		
		const lines = [
			"None",
			t + "Tab",
			t + s + "TabSpace",
			s + "Space",
			s + t + "SpaceTab"
		];
		
		await program.addDocument(lines.join("\n"));
		
		return [
			() => hasFault(program, Faults.TabsAndSpaces.code, 2),
			() => hasFault(program, Faults.TabsAndSpaces.code, 4),
			() => program.faults.count === 2
		];
	}
	
	async function coverIndentationFaultRectification()
	{
		const program = new Program();
		const t = Syntax.tab;
		const s = Syntax.space;
		const lines = [t + s + "TabSpace"];
		
		const doc = await program.addDocument(lines.join("\n"));
		if (doc instanceof Error)
			return doc;
		
		doc.edit(mutator =>
		{
			mutator.delete(0, 1);
		});
		
		return [
			() => program.faults.count === 0
		];
	}
}
