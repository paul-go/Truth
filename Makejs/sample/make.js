make.on(async () => 
{
	await make.typescript("./tsconfig.json", {
		compilerOptions: {
			outDir: "./build"
		}
	});
	make.compilationConstants("./build/a.js", {
		DEBUG: false,
		MODERN: true
	});

	await make.typescript("./tsconfig.json", {
		compilerOptions: {
			outFile: "./build/e-work.js"
		}
	});

	make.delete("./build/e.js");
	make.copy("./wedge.js", "./build");

	make.merge(
		"./build/wedge.js",
		"./build/a.js",
		"./build/b.js",
		"./build/c.js",
		"./build/d.js",
		"./build/e.js"
	);
});
