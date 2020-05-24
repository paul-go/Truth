
namespace CoverTruth
{
	/** */
	export async function coverFactCorrectionLiteral()
	{
		/*
		const facts = await createFacts();
		facts.capscrewDrive.correct(facts.slot);
		
		return [
			() => facts.capscrewDrive.is(facts.slot)
		];
		*/
	}
	
	/** */
	export async function coverFactCorrectionAlias()
	{
		/*
		const facts = await createFacts();
		const capscrew1 = facts.capscrew.introduce("capscrew1");
		const size = capscrew1.query("size");
		capscrew1.correct("1");
		
		return [
			() => size !== null,
			() => capscrew1.value === "1"
		];
		*/
	}
	
	/** */
	export async function coverFactSurfaceIntroduction()
	{
		/*
		const facts = await createFacts();
		const capscrew1 = facts.capscrew.introduce("capscrew1");
		const capscrew1Size = capscrew1.query("size");
		
		return [
			() => capscrew1.is(facts.screw),
			() => capscrew1Size?.value === "0"
		];
		*/
	}
	
	/** */
	export async function coverFactListIntroduction()
	{
		/*
		const facts = await createFacts();
		const box1 = facts.box.introduce("box1");
		const box1Screws = box1.query("screws");
		const capscrew1 = facts.capscrew.introduce("capscrew1");
		const capscrew2 = facts.capscrew.introduce("capscrew2");
		const capscrew3 = facts.capscrew.introduce("capscrew3");
		box1Screws?.introduce(capscrew1);
		box1Screws?.introduce(capscrew2);
		box1Screws?.introduce(capscrew3);
		
		return [
			() => box1Screws?.containees.length === 3,
			() => box1Screws?.containees[0] === capscrew1,
			() => box1Screws?.containees[1] === capscrew2,
			() => box1Screws?.containees[2] === capscrew3
		];
		*/
	}
	
	/** */
	async function createFacts()
	{
		const doc = await createDocument(
			"number",
			"/\\d : number",
			"drive",
			"torx : drive",
			"slot : drive",
			"screw",
			"	size : number",
			"	drive : drive",
			"capscrew : screw",
			"	size : 0",
			"	drive : torx",
			"box",
				"screws : screw...");
		
		doc.program.check();
		
		return {
			number: doc.query("number") as Truth.Fact,
			drive: doc.query("drive") as Truth.Fact,
			torx: doc.query("torx") as Truth.Fact,
			slot: doc.query("slot") as Truth.Fact,
			screw: doc.query("screw") as Truth.Fact,
			screwSize: doc.query("screw", "size") as Truth.Fact,
			screwDrive: doc.query("screw", "drive") as Truth.Fact,
			capscrew: doc.query("capscrew") as Truth.Fact,
			capscrewSize: doc.query("capscrew", "size") as Truth.Fact,
			capscrewDrive: doc.query("capscrew", "drive") as Truth.Fact,
			box: doc.query("box") as Truth.Fact,
			boxScrews: doc.query("box", "screws") as Truth.Fact
		};
	}
}
