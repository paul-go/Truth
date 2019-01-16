import * as X from "../CoreTests/X";
import * as Viz from "./Viz";
import * as Fs from "fs";


/**
 * Entry point used for debugging.
 */
setTimeout(() =>
{
	Viz.init();
	
	const fileContent = Fs.readFileSync(process.argv.slice(-1)[0], "utf8");
	const program = new X.Program(false);
	const doc = program.documents.create(fileContent);
	const typePath = [
		"SubClass",
		"Property",
		"Max"
	];
	const uri = X.Uri.create(doc.sourceUri.extend([], typePath));
	const type = program.query(uri);
	type;
},
0);
