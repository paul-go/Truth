/// <reference types="makets" />

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
	make.modulize("./bundle/reflex-core.js", "Reflex");
	
	await make.publish({
		packageFileChanges: {
			main: "./reflex-core.min.js",
			types: "./index.d.ts"
		}
	});
});
