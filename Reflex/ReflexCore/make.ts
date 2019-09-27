/// <reference path="../../make.d.ts" />

make.on(async () =>
{
	await make.typescript("./tsconfig.json");
});

make.on("publish", "bundle", async () =>
{
	make.copy("./build/source/reflex-core.js", "./bundle");
	make.copy("./build/source/reflex-core.d.ts", "./bundle/index.d.ts");
	
	await make.compilationConstants("./bundle/reflex-core.js", {
		MODERN: true,
		DEBUG: false
	});
	
	await make.minify("./bundle/reflex-core.js");
});

make.on("publish", async () => 
{
	await bundle();
	
	make.modulize("./bundle/reflex-core.js", "Reflex");
	
	await make.publish({
		directory: "./bundle",
		packageFile: "./package.json",
		packageFileChanges: {
			main: "./reflex-core.min.js",
			types: "./index.d.ts"
		},
		registries: ["http://localhost:4873"]
	});
});
