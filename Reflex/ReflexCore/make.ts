/// <reference types="makets" />

make.on(async () =>
{
	await make.typescript("./tsconfig.json");
});

make.on("publish", "bundle", async () =>
{
	make.copy("./build/reflex-core.d.ts", "./bundle/index.d.ts");
	make.copy("./readme.md", "./bundle");
	
	// Bundle Reflex Core
	make.copy("./build/reflex-core.js", "./bundle");
	make.constants("./bundle/reflex-core.js", {
		debug: false,
		modern: true
	});
	make.augment("./bundle/reflex-core.js", {
		returns: "Reflex",
	});
	
	// Not implemented yet
	if (false)
	{
		// Bundle Reflex Core IE
		make.copy("./build/reflex-core.js", "./bundle/reflex-core-ie.js");
		make.constants("./bundle/reflex-core-ie.js", {
			debug: false,
			modern: false,
		});
		make.augment("./bundle/reflex-core-ie.js", {
			returns: "Reflex",
		});
	}
});

make.on("publish", async () => 
{
	make.publish({
		packageFileChanges: {
			main: "./reflex-core.js",
			types: "./index.d.ts"
		}
	});
});
