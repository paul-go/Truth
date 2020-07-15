
namespace Cover
{
	/** */
	export async function coverCheckSingleDocumentNoFaults()
	{
		const doc = await createDocument("a", "b : a");
		const inerrant = doc.program.check();
		return () => inerrant;
	}
	
	/** */
	export async function coverCheckSingleDocumentWithFaults()
	{
		const doc = await createDocument("a : b");
		const inerrant = doc.program.check();
		return () => !inerrant;
	}
	
	/** */
	export async function coverUncheckedState()
	{
		const docs = await createComplexDocStructure();
		await docs.midL.edit(mut => mut.insert("inserted", 0));
		
		return [
			() => !docs.topL.isUnchecked,
			() => docs.midL.isUnchecked,
			() => docs.bottomL.isUnchecked,
			() => !docs.topR.isUnchecked,
			() => docs.midR.isUnchecked,
			() => docs.bottomR.isUnchecked
		];
	}
	
	/** */
	export async function coverCheckMultipleDocumentsWithFaults()
	{
		const docs = await createComplexDocStructure();
		await docs.midL.edit(mut => mut.insert("inserted", 0));
		
		return [
			() => !docs.topL.isUnchecked,
			() => docs.midL.isUnchecked,
			() => docs.bottomL.isUnchecked,
			() => !docs.topR.isUnchecked,
			() => docs.midR.isUnchecked,
			() => docs.bottomR.isUnchecked
		];
	}
	
	/**
	 * Creates a program whose documents are oriented in an 
	 * H-shaped pattern.
	 */
	async function createComplexDocStructure()
	{
		const program = new Truth.Program();
		const topL = await createDocument(program, "TopL");
		const topR = await createDocument(program, "TopR");
		const midL = await createDocument(program, `
			./${topL.uri.fileName}
			MidL : TopL`);
		const midR = await createDocument(program, `
			./${topR.uri.fileName}
			./${midL.uri.fileName}
			MidR : TopR, MidL`);
		const bottomL = await createDocument(program, `
			./${midL.uri.fileName}
			BottomL : MidL`);
		const bottomR = await createDocument(program, `
			./${midR.uri.fileName}
			BottomR : MidR`);
		
		return { topL, topR, midL, midR, bottomL, bottomR };
	}
}
