/// <reference path="build/source/make.d.ts" />

make.on("publish", async () =>
{
	make.directory("./bundle");
	make.copy("./build/source/make.js", "./bundle/main.js");
	make.copy("./build/source/make.d.ts", "./bundle/index.d.ts");
	make.copy("./readme.md", "./bundle/readme.md");	
	
	make.publish({
		packageFileChanges: {
			main: "./main.js",
			scripts: {},
			bin: {
				makets: "./main.js"
			}
		},
		registries: ["npm"],
		tag: "latest"
	});
});
