import * as X from "../CoreTests/X";
import * as Viz from "./Viz";
import * as Fs from "fs";
import * as Os from "os";


/**
 * Entry point used for debugging.
 */
setTimeout(async () =>
{
	Viz.init();
	
	// Make shift unit tests. Will clean up later.
	//const p1 = X.Uri.tryParse("./path/file.truth");
	//const p2 = X.Uri.tryParse("../../path/file.truth");
	//const p3 = X.Uri.tryParse("http://path/to/file.truth");
	//const p4 = X.Uri.tryParse("/absolute/file.truth");
	//const p5 = X.Uri.tryParse("//protocol/relative/file.truth");
	//const p6 = X.Uri.tryParse("/Users/x.truth//type/path/type");
	//const p7 = X.Uri.tryParse("/Users/x.truth//type/%2Fpattern%20here/type");
	//const p8 = X.Uri.tryParse("/Users/x.truth//type/[1]/Anonymous");
	
	const findArg = (key: string) =>
	{
		const val = process.argv.find(arg => arg.startsWith(key)) || "";
		return val.slice(key.length);
	};
	
	const filePath = findArg("--file=");
	const targetTypePath = !filePath ? [] : (() =>
	{
		const fileContent = Fs.readFileSync(filePath, "utf8");
		const firstLineEnd = fileContent.indexOf(Os.EOL);
		const firstLine = fileContent.slice("// ".length, firstLineEnd);
		return firstLine.trim().split("/");
	})();
	
	const program = new X.Program();
	const uri = X.Guard.notNull(X.Uri.tryParse(filePath));
	const doc = await program.documents.read(uri);
	
	if (doc instanceof Error)
	{
		debugger;
		return;
	}
	
	// Wait for the agents to load before continuing
	await new Promise(r => setTimeout(r, 100));
	
	//doc.edit(mutator => mutator.insert("A : B, C", 1));
	//console.log(program.graph.toString());
	//program.verify();
	//
	//doc.edit(mutator => mutator.insert("B", 2));
	//console.log(program.graph.toString());
	program.verify();
	
	//{
	//	const newUri = doc.sourceUri.extendStore("x");
	//	const param = new X.DocumentUriChangedParam(doc, newUri);
	//	program.hooks.DocumentUriChanged.run(param);
	//}
	
	const type = program.queryDocument(doc, ...targetTypePath);
	if (type instanceof X.Type)
	{
		type.derivations;
		type.container;
		type.contents;
		type.adjacents;
		type.bases;
	}
	
	const uriMessage = `Using URI: ${filePath}//${targetTypePath}`;
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
