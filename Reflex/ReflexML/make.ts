/// <reference types="makets" />

make.on("build", async () =>
{
	await make.typescript("./tsconfig.source.json");
});

make.on("test", () =>
{
	make.typescriptWatcher("../ReflexCore/tsconfig.json");
	make.typescriptWatcher("./tsconfig.test.json");
});

make.on("bundle", "publish", async () =>
{
	make.copy("./build/source/reflex-ml.js", "./bundle");
	make.copy("./build/source/reflex-ml.d.ts", "./bundle/index.d.ts");
	
	make.compilationConstants("./bundle/reflex-ml.js", {
		MODERN: true,
		DEBUG: false
	});
	make.minify("./bundle/reflex-ml.js");
});

make.on("publish", async () => 
{
	make.modulize("./bundle/reflex-ml.js", {
		exports: "Reflex",
		above: 
			`var Reflex;` +
			`if (typeof Reflex + typeof window === "undefinedundefined")` +
				`Reflex = require("reflex-core");`
	});
	
	make.concat(
		"../ReflexCore/bundle/reflex-core.js",
		"./bundle/reflex-ml.js",
		"./bundle/reflex.js",
	);
	
	make.minify("./bundle/reflex.js");
	
	await make.publish({
		packageFileChanges: {
			main: "./reflex-ml.js",
			types: "./reflex-ml.d.ts",
			eslintIgnore: null
		}
	});
});
