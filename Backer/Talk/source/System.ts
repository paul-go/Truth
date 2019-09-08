import { Query } from "./Query";
import * as Operations from "./Operations";
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
		if (doc instanceof Error)
			return doc;

    System._this = new System(doc);
  }

  /**
   * Initializes the system from a Truth text.
   */
	static async fromText(truthFileText: string)
	{
		await new Promise(r => r());
		const doc = await Truth.parse(truthFileText);
		if (doc instanceof Error)
			return doc;
		
		System._this = new System(doc);
	}

  private constructor(readonly doc: Truth.Document) {}

  /**
   * Constructs a new query on the default document.
   */
  query()
  {
    return new Query(this.doc.types.slice());
  }
}

async function main()
{
  await System.fromFile("./example.truth");
  const doc = System.this.doc;
  const types = doc.types;
  const getType = (name: string): Truth.Type => {
    const type = types.filter(t => t.name === name)[0];
    if (!type) throw new Error();
    return type;
  };
  const Employee = getType("Employee");

  // #- Query...

  const query = System.this.query();
  query.addOperation(new Operations.IsOperation(Employee));
  const ret = query.run();

  debugger;
}

main();
