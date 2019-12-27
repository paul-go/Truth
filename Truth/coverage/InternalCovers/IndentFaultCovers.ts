
namespace Truth
{
	function coverSingleIndentationFault()
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
		
		program.documents.create(lines.join("\n"));
		
		return [
			() => hasFault(program, Faults.TabsAndSpaces.code, 3),
			() => program.faults.count === 1
		];
	}
	
	function coverMultipleIndentationFault()
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
		
		program.documents.create(lines.join("\n"));
		
		return [
			() => hasFault(program, Faults.TabsAndSpaces.code, 2),
			() => hasFault(program, Faults.TabsAndSpaces.code, 4),
			() => program.faults.count === 2
		];
	}
	
	function coverIndentationFaultRectification()
	{
		const program = new Program();
		const t = Syntax.tab;
		const s = Syntax.space;
		const lines = [t + s + "TabSpace"];
		
		const doc = program.documents.create(lines.join("\n"));
		
		doc.edit(facts =>
		{
			facts.delete(0, 1);
		});
		
		return [
			() => program.faults.count === 0
		];
	}
}
