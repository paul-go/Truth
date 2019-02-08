import * as X from "../CoreTests/X";
import * as Viz from "./Viz";
import * as Fs from "fs";
import * as Os from "os";


/**
 * Entry point used for debugging.
 */
setTimeout(() =>
{
	Viz.init();
	
	// Make shift unit tests. Will clean up later.
	const p1 = X.Uri.tryParse("./path/file.truth");
	const p2 = X.Uri.tryParse("../../path/file.truth");
	const p3 = X.Uri.tryParse("http://path/to/file.truth");
	const p4 = X.Uri.tryParse("/absolute/file.truth");
	const p5 = X.Uri.tryParse("//protocol/relative/file.truth");
	const p6 = X.Uri.tryParse("/Users/x.truth//type/path/type");
	const p7 = X.Uri.tryParse("/Users/x.truth//type/%2Fpattern%20here/type");
	const p8 = X.Uri.tryParse("/Users/x.truth//type/[1]/Anonymous");
	
	const findArg = (key: string) =>
	{
		const val = process.argv.find(arg => arg.startsWith(key)) || "";
		return val.slice(key.length);
	};
	
	const filePath = findArg("--file=");
	const fileContent = Fs.readFileSync(filePath, "utf8");
	
	const typePathEnd = fileContent.indexOf(Os.EOL);
	const typePathRaw = fileContent.slice(0, typePathEnd);
	const fileContentAdjusted =
		" ".repeat(typePathRaw.length) + 
		fileContent.slice(typePathRaw.length);
	
	const typePath = typePathRaw.trim().split("/");
	const program = new X.Program();
	const doc = program.documents.create(fileContentAdjusted);
	//const type = program.queryDocument(doc, ...typePath);
	program.verify();
	
	const uriMessage = `Using URI: ${filePath}//${typePath}`;
	const pipe = "-".repeat(uriMessage.length);
	console.log(pipe);
	console.log(uriMessage);
	console.log(pipe);
	
	const printedFaults = new Set<X.Fault>();
	const printFault = (fault: X.Fault) =>
	{
		if (printedFaults.has(fault))
			return;
		 
		printedFaults.add(fault);
		console.log(fault.toString());
	}
	
	if (program.faults.count > 0)
	{
		for (const fault of program.faults.each())
			printFault(fault);
	}
	else
	{
		console.log(`No faults were detected:`);
	}
	
	/*if (type === null)
	{
		console.log(`No type exists at the input URI.`);
		return;
	}*/
},
1);
