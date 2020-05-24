
namespace CoverTruth
{
	/** */
	export async function coverLocalSubs()
	{
		const doc = await createDocument("a", "b : a");
		doc.program.check();
		const [aType] = doc.program.query("a");
		const [bType] = doc.program.query("b");
		const aSubs = Array.from(aType.eachSub());
		
		return [
			() => aSubs.length === 1,
			() => aSubs[0] === bType
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
		
		const [aType] = docA.program.query("a");
		const [bType] = docB.program.query("b");
		const aSubs = Array.from(aType.eachSub());
		
		return [
			() => aSubs.length === 1,
			() => aSubs[0] === bType
		];
	}
}
