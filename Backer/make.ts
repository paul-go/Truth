/// <reference types="makets" />

make.on("bundle", "publish", async () =>
{
	const outJsFile = "bundle/backer.js";
	
	await make.typescript("source/tsconfig.json", {
		compilerOptions: {
			target: "es5",
			stripInternal: true,
			downlevelIteration: true,
			outFile: "../" + outJsFile
		}
	});
	
	make.compilationConstants(outJsFile, {
		DEBUG: false
	});
	
	const returns = "Backer";
	
	make.definitions(
		returns,
		"bundle/backer.d.ts");
	
	make.augment(outJsFile, { returns });
	make.minify(outJsFile);
});

make.on("publish", () =>
{
	make.publish({
		packageFileChanges: {
			name: "truth-backer",
			main: "./backer.js",
			types: "./backer.d.ts",
			jest: null,
			scripts: null,
			devDependencies: null,
			eslintIgnore: null
		}
	});
});
