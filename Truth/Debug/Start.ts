import * as X from "../CoreTests/X";
import * as Viz from "./Viz";
import * as Fs from "fs";


/**
 * Entry point used for debugging.
 */
setTimeout(() =>
{
	Viz.init();
	
	const findArg = (key: string) =>
	{
		const val = process.argv.find(arg => arg.startsWith(key)) || "";
		return val.slice(key.length);
	};
	
	const filePath = findArg("--file=");
	const typePath = findArg("--typePath=").split("/");
	const fileContent = Fs.readFileSync(filePath, "utf8");
	const program = new X.Program(false);
	const doc = program.documents.create(fileContent);
	const type = program.query(doc, ...typePath);
	
	const uriMessage = `Using URI: ${filePath}//${typePath}`;
	const pipe = "-".repeat(uriMessage.length);
	console.log(pipe);
	console.log(uriMessage);
	console.log(pipe);
	
	if (type === null)
	{
		console.log(`No type exists at the input URI.`);
		return;
	}
	
	const printedFaults = new Set<X.Fault>();
	const printFault = (fault: X.Fault) =>
	{
		if (printedFaults.has(fault))
			return;
		
		printedFaults.add(fault);
		const t = fault.type;
		
		const statement = X.Guard.notNull(
			fault.source instanceof X.Statement ? fault.source :
			fault.source instanceof X.Span ? fault.source.statement :
			fault.source instanceof X.InfixSpan ? fault.source.statement :
			null);
		
		const line = doc.getLineNumber(statement);
		const causedBy = fault.source.constructor.name;
		console.log(`\t${t.code}: ${t.message} on line ${line} (${causedBy})`);
	}
	
	if (type.faults.length > 0)
	{
		console.log(`The following faults were detected at the input URI:`);
		
		for (const fault of type.faults)
			printFault(fault);
	}
	else
	{
		console.log(`No faults were detected at the input URI.`);
	}
	
	if (program.faults.count > 0)
	{
		console.log(`The following anciliary faults were also detected:`);
		
		for (const fault of program.faults.each())
			printFault(fault);
	}
	else
	{
		console.log(`No anciliary faults were detected:`);
	}
},
1);
