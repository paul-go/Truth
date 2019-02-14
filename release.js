/**
 * Build script that creates a new release of the TypeScript compiler.
 */

const ReleaseDir = "./Build/Release/";
const UnminifiedFile = ReleaseDir + "truth.js";
const MinifiedFile = ReleaseDir + "truth.min.js";

const Fs = require("fs");

task("Compiling to temporary directory...", () =>
{
	exec("tsc -p ./tsconfig.release.json");
});

task("Generating type definitions file...", () =>
{
	const bundle = require("./TypesBundler/TypesBundler.js");
	bundle({
		in: ReleaseDir + "Core/X.d.ts",
		out: [
			ReleaseDir + "truth.d.ts"
		],
		namespace: "Truth",
		module: "truth-compiler",
		footer: [
			"declare const Hooks: Truth.HookTypesInstance;",
			"declare const Program: Truth.Program;"
		]
	});
});

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
		input: ReleaseDir + "Core/X.js",
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

// Disable for this until we can get this:
// https://github.com/terser-js/terser
// working
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

task("Done", () => {});


//
// Build script tools
//


function exec(cmd)
{
	require("child_process").execSync(cmd.replace(/[\r\n]/g, ""));
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
