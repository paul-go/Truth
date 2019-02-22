const Fs = require("fs");
const Path = require("path");
const Process = require("child_process");

/**
 * Build script that creates a new release of the Truth compiler.
 */

const BuildDir = "./Build/";
const TempDir = BuildDir + "Temp/";
const ReleaseDir = BuildDir + "Release/";
const UnminifiedFileName = "truth.js";
const MinifiedFileName = "truth.min.js";
const UnminifiedFile = ReleaseDir + UnminifiedFileName;
const MinifiedFile = ReleaseDir + MinifiedFileName;
const ShouldPublish = process.argv.includes("--publish");


//
//
task("Compiling to temporary directory...", () =>
{
	exec(`tsc
		--project ./Core/tsconfig.json
		--outDir ${TempDir}
		--module es2015
		--downlevelIteration
		--declaration
	`);
});

//
//
task("Bundling into a single file...", async () =>
{
	const rollup = require("rollup").rollup;
	
	const output = {
		name: "Truth",
		file: UnminifiedFile,
		format: "iife",
		sourcemap: "inline",
		footer: `typeof module === "object" && (module.exports = Truth);`
	};
	
	const options = {
		input: TempDir + "X.js",
		output,
		treeshake: false,
		onwarn: warning =>
		{
			if (warning.code === "THIS_IS_UNDEFINED")
				return;
			
			if (warning.code === "CIRCULAR_DEPENDENCY")
				return;
			
			console.warn(warning.message);
		}
	};
	
	const built = await rollup(options);
	await built.write(output);
});

//
//
task("Replacing debug constant", () =>
{
	const content = Fs.readFileSync(UnminifiedFile)
		.toString("utf8")
		// Replaces the debug string with a long number
		// that is of an equivalent character length (to prevent
		// source maps from getting messed up), but also
		// results in a falsy value.
		.replace(/"DEBUG"/gm, "0x00000");
	
	Fs.writeFileSync(UnminifiedFile, content);
});

//
//
task("Minifying code...", () =>
{
	const terser = require("terser");
	const unminifiedSource = Fs.readFileSync(UnminifiedFile).toString("utf8");
	
	const terserResult = terser.minify(unminifiedSource, {
		keep_classnames: true,
		keep_fnames: true,
		warnings: true,
		sourceMap: {
			url: "inline"
		},
		compress: {
			unused: false
		}
	});
	
	if (terserResult.error)
	{
		console.error(terserResult.error);
		return;
	}
	
	if (terserResult.warnings)
		for (const warning of terserResult.warnings)
			console.log(warning);
	
	Fs.writeFileSync(MinifiedFile, terserResult.code);
});


// 
// At this point the JavaScript side should be fully compiled, and
// so now it's time to deploy the two separate projects to npm.
// 


//
//
task("Generating agent type definitions file...", async () =>
{
	const bundlerOptions = {
		namespace: "Truth",
		globalize: true,
		header: [
			"declare global {",
			"\tconst program: Truth.Program;",
			"}"
		]
	};
	
	await createBundle("truth-agent", bundlerOptions);
});


//
//
task("Generating compiler type definitions file...", async () =>
{
	const bundlerOptions = {
		module: "truth-compiler"
	};
	
	await createBundle("truth-compiler", bundlerOptions);
});


//
//
task("Cleanup", async () =>
{
	// This is a hack for now that waits a second before cleaning
	// everything up. At some point someone can figure out why
	// this task isn't running after all others.
	return new Promise(r => setTimeout(() =>
	{
		exec("rm -rf " + TempDir);
		r();
	},
	1000));
});


//
//
task("Done", () => {});


/** */
async function createBundle(packageName, dtsBundlerOptions)
{
	const targetDir = Path.join(ReleaseDir, packageName);
	const dtsFile = packageName + ".d.ts";
	exec("mkdir -p " + targetDir);
	
	const bundle = require("./TypesBundler/TypesBundler.js");
	await bundle({
		in: TempDir + "X.d.ts",
		out: [
			Path.join(targetDir, dtsFile)
		],
		...dtsBundlerOptions
	});
	
	Fs.copyFileSync(MinifiedFile, Path.join(targetDir, MinifiedFileName));
	Fs.copyFileSync(UnminifiedFile, Path.join(targetDir, UnminifiedFileName));
	Fs.copyFileSync(UnminifiedFile, Path.join(targetDir, UnminifiedFileName));
	
	const readmeSrc = Path.join(process.cwd(), "README.md");
	const readmeDst = Path.join(targetDir, "README.md");
	Fs.copyFileSync(readmeSrc, readmeDst);
	
	const packageJson = readPackageJson(process.cwd());
	delete packageJson.jest;
	delete packageJson.scripts;
	delete packageJson.devDependencies;
	
	packageJson.name = packageName;
	packageJson.main = "./" + UnminifiedFileName;
	packageJson.types = `./${packageName}.d.ts`;
	packageJson.files = [
		UnminifiedFileName,
		MinifiedFileName,
		packageName + ".d.ts"
	];
	
	writePackageJson(targetDir, packageJson);
	
	if (ShouldPublish)
		exec(`cd ${targetDir} && npm publish`);
}


//
// Build script tools
//


function exec(command)
{
	const cmd = command.replace(/[\r\n]/g, "").trim();
	
	try
	{
		return Process.execSync(cmd).toString("utf8");
	}
	catch (e)
	{
		console.error(e.message);
		return null;
	}
}

function readPackageJson(dir)
{
	const path = Path.join(dir, "package.json");
	const jsonText = Fs.readFileSync(path).toString("utf8");
	const json = JSON.parse(jsonText);
	return json;
}

function writePackageJson(dir, packageJson)
{
	const path = Path.join(dir, "package.json")
	const output = JSON.stringify(packageJson, null, "\t");
	Fs.writeFileSync(path, output);
}

async function task(title, taskFn)
{
	const self = this;
	self.entries = self.entries || [];
	self.entries.push({ title, taskFn });
	
	if (self.hasInit)
		return;
	
	self.hasInit = true;
	setTimeout(async () =>
	{
		for (const entry of self.entries)
		{
			console.log(entry.title);
			const result = entry.taskFn();
			
			if (result instanceof Promise)
				await result;
		}
	}, 0);
}
