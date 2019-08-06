/// <reference path="../../make.d.ts" />

make.on("build", async () =>
{
	await make.typescript("./tsconfig.source.json");
});

make.on("bundle", async () =>
{
	await make.typescript("./tsconfig.source.json");
	
	make.copy("./build/source/reflex.js", "./bundle");
	make.modulize("./bundle/reflex.js", "{ Reflex: Reflex, re: re }");
	
	make.copy("./build/source/reflex.d.ts", "./bundle");
	make.minify("./bundle/reflex.js");
	
	await make.publish({
		directory: "./bundle",
		packageFile: "./package.json",
		packageFileChanges: {
			main: "./reflex.js",
			types: "./reflex.d.ts"
		},
		registries: ["http://localhost:4873"]
	});
});
