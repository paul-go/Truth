import { promises as FS } from "fs";
import { parse, Document} from "../../Truth/Core/X";

export default class Scanner 
{
	static async FromFile(path: string)
	{
		const Content = await FS.readFile(path, "utf-8");
		const Doc = await parse(Content);
		return new Scanner(Doc);
	}
	
	constructor(public Document: Document)
	{
		console.log(Document.types);
	}
}