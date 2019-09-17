
/**
 * This file is the main entry point of the Makejs tool.
 */

process.on("SIGINT", () => 
{
	make.on.stage(process.argv, "kill");
});

process.on("beforeExit", () => 
{
	make.on.stage(process.argv, "idle");
});

process.on("exit", () => 
{
	make.on.stage(process.argv, "exit");
});

setImmediate(async () =>
{
	const tags = process.argv.filter(arg => /^[a-z]+(-[a-z]+)*$/gi.test(arg));
	const makeFilePath = Path.join(process.cwd(), "make.js");
	
	if (!Fs.existsSync(makeFilePath))
		throw new Error("No make.js file found at: " + makeFilePath);
	
	const makeFileText = Fs.readFileSync(makeFilePath, "utf8");
	const makeFileFunction = new Function("make", makeFileText).bind(null);
	
	// Running this function causes all the make.on() calls
	// to be collected, which are run in the next step.
	makeFileFunction(make);
	
	// Create the build and bundle folders
	FsExtra.mkdirpSync("./build");
	FsExtra.mkdirpSync("./bundle");
	
	await make.on.stageAsync(process.argv, "start");
	await make.on.stageAsync(process.argv, "init");
	await make.on.start(process.argv, tags);
	console.log("Complete.");
});

