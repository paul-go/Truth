
namespace CoverTruth
{
	/** */
	export async function coverStatementChangeDelete()
	{
		const doc = await createDocument("A", "B", "C");
		const changes = await captureChanges(doc, mut => mut.delete(1));
		
		return [
			() => changes.length === 1,
			() => changes[0].kind === "delete",
			() => changes[0].statement.sourceText === "A"
		];
	}
	
	/** */
	export async function coverStatementChangeDeleteNoop()
	{
		const doc = await createDocument("A", "", "B");
		const changes = await captureChanges(doc, mut => mut.delete(2));
		
		return [
			() => changes.length === 1,
			() => changes[0].kind === "delete",
			() => changes[0].statement.sourceText === "A"
		];
	}
	
	/** */
	async function captureChanges(
		doc: Truth.Document,
		mutFn: (mut: Truth.IDocumentMutator) => void)
	{
		let changes: readonly Truth.IStatementChangeInfo[] = [];
		
		doc.program.once("statementChange", (doc, changesList) =>
		{
			changes = changesList;
		});
		
		doc.edit(mutFn);
		await doc.program.wait();
		return changes;
	}
}
