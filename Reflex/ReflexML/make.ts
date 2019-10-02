/// <reference types="makets" />

make.on(() =>
{
	console.log("TODO: Run makets on ReflexCore"); 
});

make.on("build", async () =>
{
	await make.typescript("./tsconfig.json");
});

make.on("test", () =>
{
	make.typescriptWatcher("../ReflexCore/tsconfig.json");
	make.typescriptWatcher("./tsconfig.test.json");
});

make.on("bundle", "publish", async () =>
{
	const exports = ["Reflex", "on", "once", "only", "ml"];
	
	//# Create reflex.js (which contains Core + ML)
	
	make.concat(
		"../ReflexCore/bundle/reflex-core.js",
		"./build/source/reflex-ml.js",
		"./bundle/reflex.js",
	);
	
	make.augment("./bundle/reflex.js", {
		exports,
		globals: exports,
		encapsulate: true
	});
	
	make.minify("./bundle/reflex.js");
	
	//# Create reflex-ml.js (which require()'s Core if necessary)
	
	make.copy("./build/source/reflex-ml.js", "./bundle");
	make.augment("./bundle/reflex-ml.js", {
		exports,
		globals: exports,
		above: 
			`var Reflex;` +
			`if (typeof navigator !== "object" && typeof require === "function")` +
				`Reflex = require("reflex-core").Reflex;`,
	});
	
	make.compilationConstants("./bundle/reflex-ml.js", {
		MODERN: true,
		DEBUG: false
	});
	
	make.minify("./bundle/reflex-ml.js");
	
	//# Handle the d.ts processing
	
	make.copy("./build/source/reflex-ml.d.ts", "./bundle/index.d.ts");
	make.augment("./bundle/index.d.ts", {
		above: `/// <reference types="reflex-core" />\n\n`
	});
});

make.on("publish", async () => 
{
	make.publish({
		packageFileChanges: {
			main: "./reflex-ml.js",
			eslintIgnore: null,
			// Reflex ML only has a dependency on Reflex Core
			// when it's used from the npm module. When it's
			// drawn in via a script tag, this reflex.js file will have
			// the core built into it.
			dependencies: make.npm.latestOf(["reflex-core"])
		}
	});
});
