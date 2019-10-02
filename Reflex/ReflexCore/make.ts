/// <reference types="makets" />

make.on(async () =>
{
	await make.typescript("./tsconfig.json");
});

make.on("publish", "bundle", async () =>
{
	make.copy("./build/source/reflex-core.js", "./bundle");
	make.copy("./build/source/reflex-core.d.ts", "./bundle/index.d.ts");
	make.copy("./readme.md", "./bundle");
	
	make.compilationConstants("./bundle/reflex-core.js", {
		MODERN: true,
		DEBUG: false
	});
});

make.on("publish", async () => 
{
	make.augment("./bundle/reflex-core.js", {
		exports: "Reflex",
		globals: "Reflex",
		encapsulate: true,
		encapsulatedReturns: "Reflex"
	});
	
	make.publish({
		packageFileChanges: {
			main: "./reflex-core.js",
			types: "./index.d.ts",
			eslintIgnore: null
		}
	});
});
