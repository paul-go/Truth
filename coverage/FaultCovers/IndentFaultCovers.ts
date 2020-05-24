
namespace CoverTruth
{
	const t = Truth.Syntax.tab;
	const s = Truth.Syntax.space;
	
	/** */
	export async function coverSingleIndentationFault()
	{
		const [doc] = await createLanguageCover([
			"None",
			t + "Tab",
			s + "Space",
			t + s + "TabSpace"
		].join("\n"));
		
		return () => doc.hasFaults([Truth.Faults.TabsAndSpaces, 3]);
	}
	
	/** */
	export async function coverMultipleIndentationFault()
	{
		const [doc] = await createLanguageCover([
			"None",
			t + "Tab",
			t + s + "TabSpace",
			s + "Space",
			s + t + "SpaceTab"
		].join("\n"));
		
		return () => doc.hasFaults(
			[Truth.Faults.TabsAndSpaces, 2],
			[Truth.Faults.TabsAndSpaces, 4]);
	}
	
	/** */
	export async function coverIndentationFaultRectification()
	{
		const [doc] = await createLanguageCover(t + s + "TabSpace");
		
		doc.edit(mutator =>
		{
			mutator.delete(0, 1);
		});
		
		return () => !doc.hasFaults();
	}
}
