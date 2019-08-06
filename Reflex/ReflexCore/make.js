/// <reference path="../../make.d.ts" />

make.on(async () =>
{
	await make.typescript("./tsconfig.source.json");
});

make.on("bundle", async () =>
{
	make.copy("./build/source/reflex-core.js", "./bundle");
	//make.modulize("./bundle/reflex-core.js", "{ Reflex: Reflex, re: re }");
	make.copy("./build/source/reflex-core.d.ts", "./bundle");
	//make.minify("./bundle/reflex-core.js");
	
	await make.publish({
		directory: "./bundle",
		packageFile: "./package.json",
		packageFileChanges: {
			main: "./reflex-core.js",
			types: "./reflex-core.d.ts"
		},
		registries: ["http://localhost:4873"]
	});
});
