
/**
 * Entry point used for debugging.
 */
setTimeout(async () =>
{
	const findArg = (key: string) =>
	{
		const val = process.argv.find(arg => arg.startsWith(key)) || "";
		return val.slice(key.length);
	};
	
	const filePath = findArg("--file=");
	const inspectPath = findArg("--inspect=").split("/");
	const program = new Truth.Program();
	const uri = Truth.Not.null(Truth.Uri.tryParse(filePath));
	const doc = await program.documents.read(uri);
	
	if (doc instanceof Error)
	{
		debugger;
		return;
	}
	
	// Wait for the agents to load before continuing
	await new Promise(r => setTimeout(r, 100));
	
	///doc.edit(mutator => mutator.insert("A : B, C", 1));
	///console.log(program.graph.toString());
	///program.verify();
	///
	///doc.edit(mutator => mutator.insert("B", 2));
	///console.log(program.graph.toString());
	program.verify();
	
	///{
	///	const newUri = doc.sourceUri.extendStore("x");
	///	const param = new Truth.DocumentUriChangedParam(doc, newUri);
	///	program.hooks.DocumentUriChanged.run(param);
	///}
	
	const type = program.query(doc, ...inspectPath);
	if (type instanceof Truth.Type)
	{
		const aliases = type.aliases;
		const values = type.values;
		const bases = type.bases;
		const derivations = type.derivations;
		const container = type.container;
		const contents = type.contents;
		const adjacents = type.adjacents;
	}
	
	const uriMessage = `Using URI: ${filePath}//${inspectPath}`;
	const pipe = "-".repeat(uriMessage.length);
	console.log(pipe);
	console.log(uriMessage);
	console.log(pipe);
	
	const printedFaults = new Set<Truth.Fault>();
	const printFault = (fault: Truth.Fault) =>
	{
		if (printedFaults.has(fault))
			return;
		
		printedFaults.add(fault);
		console.log(fault.toString());
	};
	
	if (program.faults.count > 0)
	{
		for (const fault of program.faults.each())
			printFault(<any>fault);
	}
	else
	{
		console.log("No faults were detected:");
	}
	
	///if (type === null)
	///{
	///	console.log(`No type exists at the input URI.`);
	///	return;
	///}
},
1);
