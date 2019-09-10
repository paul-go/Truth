import { Query } from "./Query";
import * as Truth from "truth-compiler";

/**
 * Manages the global Truth document and context.
 */
export class System 
{
	/**
	 * Singleton instance.
	 */
	private static _this: System | undefined;

	/**
	 * Singleton accessor property.
	 */
	static get this() 
	{
		if (!System._this)
			throw new Error("You must first initialize a TruthTalk system.");
		return System._this;
	}

	/**
	 * Initializes the system from a Truth file.
	 */
	static async fromFile(truthFilePath: string) 
	{
		await new Promise(r => r());
		const doc = await Truth.read(truthFilePath);
		if (doc instanceof Error) return doc;

		System._this = new System(doc);
	}

	/**
	 * Initializes the system from a Truth text.
	 */
	static async fromText(truthFileText: string) 
	{
		await new Promise(r => r());
		const doc = await Truth.parse(truthFileText);
		if (doc instanceof Error) return doc;

		System._this = new System(doc);
	}

	private readonly dataTypes: Truth.Type[];

	private constructor(readonly doc: Truth.Document) 
	{
		// TODO(qti3e) This is just a workaround to split Truth data
		// from Truth code.
		const index = doc.types.findIndex(type => type.name === "@data");
		this.dataTypes = doc.types.slice(index < 0 ? 0 : index + 1);
	}

	/**
	 * Constructs a new query on the default document.
	 */
	query() 
	{
		return new Query(this.dataTypes);
	}
}
