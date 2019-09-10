/// <reference path="../make.d.ts" />

make.on(async () =>
{
	await make.typescript("./tsconfig.composite.json");
});

async function bundle()
{
	make.copy("./build/source/reflex.js", "./bundle");
	make.copy("./build/source/reflex.d.ts", "./bundle");
	await make.compilationConstants("./bundle/reflex.js", {
		MODERN: true,
		DEBUG: false
	});
	await make.minify("./bundle/reflex.js");
}

make.on("bundle", bundle);

make.on("publish", async () => 
{
	await bundle();
	await make.publish({
		directory: "./bundle",
		packageFile: "./package.json",
		packageFileChanges: {
			main: "./reflex.min.js",
			types: "./reflex.d.ts"
		},
		registries: ["http://localhost:4873"]
	});
});
