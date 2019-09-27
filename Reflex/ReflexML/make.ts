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
		packageFileChanges: {
			main: "./reflex-ml.min.js",
			types: "./reflex-ml.d.ts"
		}
	});
});
