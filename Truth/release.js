/**
 * Build script that creates a new release of the TypeScript compiler.
 */

const ReleaseDir = "./Build/Release/";
const UnminifiedFile = ReleaseDir + "truth.js";
const MinifiedFile = ReleaseDir + "truth.min.js";

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
		sourcemap: "inline"
	};
	
	const options = {
		input: ReleaseDir + "Core/X.js",
		output,
		onwarn: warning =>
		{
			if (warning.code === "THIS_IS_UNDEFINED")
				return;
			
			if (warning.code === "CIRCULAR_DEPENDENCY")
				return;
			
			console.warn(warning.message);
		}
	};
	
	const rollupBuild = await rollup(options);
	rollupBuild.write(output);
});

task("Minifying code...", () =>
{
	exec(`uglifyjs ${UnminifiedFile}
		--output ${MinifiedFile}
		--keep-fnames`);
});

async function task(message, taskFn)
{
	console.log(message);
	await taskFn();
}

function exec(cmd)
{
	require("child_process").execSync(cmd.replace(/[\r\n]/g, ""));
}
