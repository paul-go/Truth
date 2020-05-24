
namespace CoverTruth
{
	/** */
	export async function coverTypeCorrectionLiteral()
	{
		/*
		const types = await createTypes();
		types.capscrewDrive.correct(types.slot);
		
		return [
			() => types.capscrewDrive.is(types.slot)
		];
		*/
	}
	
	/** */
	export async function coverTypeCorrectionAlias()
	{
		/*
		const types = await createTypes();
		const capscrew1 = types.capscrew.introduce("capscrew1");
		const size = capscrew1.query("size");
		capscrew1.correct("1");
		
		return [
			() => size !== null,
			() => capscrew1.value === "1"
		];
		*/
	}
	
	/** */
	export async function coverTypeSurfaceIntroduction()
	{
		/*
		const types = await createTypes();
		const capscrew1 = types.capscrew.introduce("capscrew1");
		const capscrew1Size = capscrew1.query("size");
		
		return [
			() => capscrew1.is(types.screw),
			() => capscrew1Size?.value === "0"
		];
		*/
	}
	
	/** */
	export async function coverTypeListIntroduction()
	{
		/*
		const types = await createTypes();
		const box1 = types.box.introduce("box1");
		const box1Screws = box1.query("screws");
		const capscrew1 = types.capscrew.introduce("capscrew1");
		const capscrew2 = types.capscrew.introduce("capscrew2");
		const capscrew3 = types.capscrew.introduce("capscrew3");
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
	async function createTypes()
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
			number: doc.query("number") as Truth.Type,
			drive: doc.query("drive") as Truth.Type,
			torx: doc.query("torx") as Truth.Type,
			slot: doc.query("slot") as Truth.Type,
			screw: doc.query("screw") as Truth.Type,
			screwSize: doc.query("screw", "size") as Truth.Type,
			screwDrive: doc.query("screw", "drive") as Truth.Type,
			capscrew: doc.query("capscrew") as Truth.Type,
			capscrewSize: doc.query("capscrew", "size") as Truth.Type,
			capscrewDrive: doc.query("capscrew", "drive") as Truth.Type,
			box: doc.query("box") as Truth.Type,
			boxScrews: doc.query("box", "screws") as Truth.Type
		};
	}
}
