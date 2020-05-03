
namespace CoverTruth
{
	/** */
	export async function coverLocalSubs()
	{
		const doc = await createDocument("a", "b : a");
		doc.program.check();
		const [aFact] = doc.program.query("a");
		const [bFact] = doc.program.query("b");
		const aSubs = Array.from(aFact.eachSub());
		
		return [
			() => aSubs.length === 1,
			() => aSubs[0] === bFact
		];
	}
	
	/** */
	export async function coverForeignSubs()
	{
		const program = new Truth.Program();
		const docA = await createDocument(program, "a");
		const docB = await createDocument(program, `
			./${docA.uri.fileName}
			b : a`);
		
		docA.program.check();
		
		const [aFact] = docA.program.query("a");
		const [bFact] = docB.program.query("b");
		const aSubs = Array.from(aFact.eachSub());
		
		return [
			() => aSubs.length === 1,
			() => aSubs[0] === bFact
		];
	}
}
