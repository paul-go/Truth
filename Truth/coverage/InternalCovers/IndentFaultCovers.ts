
namespace Truth
{
	const t = Syntax.tab;
	const s = Syntax.space;
	
	async function coverSingleIndentationFault()
	{
		const [doc] = await createLanguageCover([
			"None",
			t + "Tab",
			s + "Space",
			t + s + "TabSpace"
		].join("\n"));
		
		return () => doc.hasFaults([Faults.TabsAndSpaces, 3]);
	}
	
	async function coverMultipleIndentationFault()
	{
		const [doc] = await createLanguageCover([
			"None",
			t + "Tab",
			t + s + "TabSpace",
			s + "Space",
			s + t + "SpaceTab"
		].join("\n"));
		
		return () => doc.hasFaults(
			[Faults.TabsAndSpaces, 2],
			[Faults.TabsAndSpaces, 4]);
	}
	
	async function coverIndentationFaultRectification()
	{
		const [doc] = await createLanguageCover(t + s + "TabSpace");
		
		doc.edit(mutator =>
		{
			mutator.delete(0, 1);
		});
		
		return [
			() => !doc.hasFaults()
		];
	}
}
