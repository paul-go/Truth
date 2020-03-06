/// <reference types="makets" />

make.on("bundle", "publish", async () =>
{
	const outJsFile = "bundle/truth.js";
	
	await make.typescript("source/tsconfig.json", {
		compilerOptions: {
			target: "es5",
			stripInternal: true,
			downlevelIteration: true,
			outFile: "../" + outJsFile
		}
	});
	
	make.constants(outJsFile, {
		DEBUG: false
	});
	
	const returns = "Truth";
	
	make.definitions(
		returns,
		"bundle/truth.d.ts");
	
	make.augment(outJsFile, { returns });
	make.minify(outJsFile);
});

make.on("publish", () =>
{
	make.publish({
		packageFileChanges: {
			name: "truth-compiler",
			main: "./truth.js",
			types: "./truth.d.ts",
			jest: null,
			scripts: null,
			devDependencies: null,
			eslintIgnore: null
		}
	});
});
