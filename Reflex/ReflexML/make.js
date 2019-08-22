/* eslint-disable filenames/match-regex */
/// <reference path="../../make.d.ts" />

make.on("build", async () =>
{
	await make.typescript("./tsconfig.source.json");
});

make.on("test", () =>
{
	make.typescript("../ReflexCore/tsconfig.json", true);
	make.typescript("./tsconfig.test.json", true);
});

async function bundle()
{
	make.copy("./build/source/reflex-ml.js", "./bundle");
	make.copy("./build/source/reflex-ml.d.ts", "./bundle");
	await make.compilationConstants("./bundle/reflex-ml.js", {
		MODERN: true,
		DEBUG: false
	});
	await make.minify("./bundle/reflex-ml.js");
}

make.on("bundle", bundle);

make.on("publish", async () => 
{
	await bundle();
	await make.publish({
		directory: "./bundle",
		packageFile: "./package.json",
		packageFileChanges: {
			main: "./reflex-ml.min.js",
			types: "./reflex-ml.d.ts"
		},
		registries: ["http://localhost:4873"]
	});
});
