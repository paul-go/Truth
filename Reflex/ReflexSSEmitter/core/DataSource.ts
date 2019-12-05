
namespace Reflex.SS.Emitter
{
	// MDN data source URLs
	const DataSource = Object.freeze({
		properties: "https://raw.githubusercontent.com/mdn/data/master/css/properties.json",
		units: "https://raw.githubusercontent.com/mdn/data/master/css/units.json",
		atRules: "https://github.com/mdn/data/raw/master/css/at-rules.json",
		syntaxes: "https://github.com/mdn/data/raw/master/css/syntaxes.json"
	});

	/**
	 * Reads JSON data from the specified URL.
	 */
	async function readDataSource<T extends object>(url: string): Promise<T>
	{
		const fetch = require("node_fetch");
		const res = await fetch(url);
		const json: T = await res.json();
		return json;
	}

	/** */
	async function readProperties()
	{
		return readDataSource<IProperties>(DataSource.properties);
	}

	/** */
	async function readUnits()
	{
		return readDataSource<IUnits>(DataSource.units);
	}

	/** */
	async function readAtRules()
	{
		return readDataSource<IAtRules>(DataSource.atRules);
	}

	/** */
	async function readSyntaxes()
	{
		return readDataSource<ISyntaxes>(DataSource.syntaxes);
	}

	/** */
	interface IProperties
	{
		[property: string]: IProperty;
	}

	/** */
	interface IProperty
	{
		syntax: string;
		media: string;
		inherited: boolean;
		animationType: string;
		percentages: string;
		groups: string[];
		initial: string;
		appliesto: string;
		computed: string | string[];
		order: string;
		status: string;
		mdn_url?: string;
	}

	/** */
	interface IUnits
	{
		[name: string]: IUnit
	}

	/** */
	interface IUnit
	{
		groups: UnitGroup[];
		status: "standard";
	}

	/** */
	const enum UnitGroup
	{
		angles = "CSS Angles",
		flexibleLengths = "CSS Flexible Lengths",
		frequencies = "CSS Frequencies",
		gridLayout = "CSS Grid Layout",
		lengths = "CSS Lengths",
		resolutions = "CSS Resolutions",
		times = "CSS Times",
		units = "CSS Units",
	}

	/** */
	interface IAtRules
	{
		[name: string]: IAtRule;
	}

	/** */
	interface IAtRule
	{
		syntax: string;
		interfaces: string[];
		groups: string[];
		descriptors: IDescriptors;
		status: string;
	}

	/** */
	interface IDescriptor
	{
		syntax: string;
		media: string;
		percentages: string | string[];
		initial: string | string[];
		computed: string | string[];
		order: string;
	}

	/** */
	interface IDescriptors
	{
		[descriptor: string]: IDescriptor;
	}

	/** */
	interface ISyntax
	{
		syntax: string;
	}

	/** */
	interface ISyntaxes
	{
		[property: string]: ISyntax;
	}
}
