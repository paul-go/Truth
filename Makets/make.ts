/// <reference path="build/make.d.ts" />

make.on("publish", async () =>
{
	make.directory("./bundle");
	make.copy("./build/make.js", "./bundle/main.js");
	make.copy("./build/make.d.ts", "./bundle/index.d.ts");
	make.copy("./readme.md", "./bundle/readme.md");	
	
	make.publish({
		packageFileChanges: {
			main: "./main.js",
			scripts: {},
			bin: {
				makets: "./main.js"
			}
		},
		registries: [],
		tag: "latest"
	});
	
	// Copy the package to the monorepo's root node_modules
	// folder, to avoid having to use npm link.
	make.directory("../node_modules/makets");
	make.copy("./bundle", "../node_modules/makets");
});
