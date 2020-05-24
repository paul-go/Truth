
namespace CoverTruth
{
	/** 
	 * This example demonstrates 
	 */
	export async function coverSurfaceAlias()
	{
		const [doc] = await createLanguageCover(`
			foo
			/1 : foo
			aliased : 1
		`);
		
		const [foo, aliased] = typesOf(doc, "foo", "aliased");
		return [
			() => aliased.is(foo),
			() => aliased.alias === "1"
		];
	}
	
	/**
	 * 
	 */
	export async function coverSubmergedSupervisedAlias()
	{
		const [doc] = await createLanguageCover(`
			digit
			/1 : digit
			class
				d : digit
			subclass : class
				d : 1
		`);
		
		const [digit, classD, subclassD] = typesOf(doc,
			"digit",
			["class", "d"],
			["subclass", "d"]);
		
		return [
			() => subclassD.is(digit),
			() => subclassD.alias === "1",
			() => classD.alias === "",
		];
	}
	
	/** */
	export async function coverMultiPatternAlias()
	{
		const [doc] = await createLanguageCover(`
			digit
			number
			/(1|2) : digit
			/(1|2) : number
			value1 : number, 1
			value2 : digit, 2
		`);
		
		const [digit, number, value1, value2] = typesOf(doc,
			"digit",
			"number",
			"value1",
			"value2");
		
		printFaults(doc.program);
		
		return [
			() => value1.is(number),
			() => !value1.is(digit),
			() => value1.alias === "1",
			() => value2.is(digit),
			() => !value2.is(number),
			() => value2.alias === "2"
		];
	}
	
	/** */
	export async function coverAliasWithComma()
	{
		const [doc] = await createLanguageCover(`
			text
			/".+" : text
			value : text, "a, text, b"
		`);
		
		printFaults(doc.program);
		const [value] = typesOf(doc, "value");
		
		return [
			() => value.alias === `"a, text, b"`
		];
	}
	
	/** */
	export async function coverAliasWithCaptures()
	{
		const [doc] = await createLanguageCover(`
			text
			/"(.+)" : text
			value : text, "without, quotes"
		`);
		
		const [value] = typesOf(doc, "value");
		const cap = value.capture(1);
		
		return [
			() => cap  === `without quotes`
		];
	}
	
	/**
	 * This example demonstrates a fault being generated, because 
	 * both of these are going to resolve the same way, and you can't
	 * have two aliases doing this.
	 */
	export async function coverAliasAcrossFragmentationFault()
	{
		//! Not implemented
		
		const [doc] = await createLanguageCover(`
			text
			/".+" : text
			value : text, "a"
			value : text, "b"
		`);
		
		printFaults(doc.program);
		
		return [
			() => false
		];
	}
}
