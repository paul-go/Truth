/* eslint-disable filenames/match-regex */
/// <reference path="../../make.d.ts" />

make.on(async () =>
{
	await make.typescript("./tsconfig.json");
});

async function bundle()
{
	make.copy("./build/source/reflex-core.js", "./bundle");
	make.copy("./build/source/reflex-core.d.ts", "./bundle");
	await make.compilationConstants("./bundle/reflex-core.js", {
		MODERN: true,
		DEBUG: false
	});
	await make.minify("./bundle/reflex-core.js");
}

make.on("bundle", bundle);

make.on("publish", async () => 
{
	await bundle();
	await make.publish({
		directory: "./bundle",
		packageFile: "./package.json",
		packageFileChanges: {
			main: "./reflex-core.min.js",
			types: "./reflex-core.d.ts"
		},
		registries: ["http://localhost:4873"]
	});
});
