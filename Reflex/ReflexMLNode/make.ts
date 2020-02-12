/// <reference types="makets" />

make.on(async () =>
{
	console.log("TODO: Run makets on ReflexCore");
	console.log("TODO: Run makets on ReflexML");
	await make.typescript("./core/tsconfig.json");
});

make.on("bundle", "publish", async () =>
{
	const src = "./build/";
	const dst = "./bundle/";
	
	make.copy(src + "Dom.js", dst);
	make.copy(src + "Emit.js", dst);
	make.copy(src + "Restore.js", dst);
	make.minify(dst + "Restore.js");
	
	make.file(dst + "index.js", [
		`"use strict";`,
		`require("./Dom.js");`,
		`module.exports = require("reflex-ml");`,
		`Object.assign(module.exports.ml, require("./Emit.js"));`
	].join("\n"));
	
	make.copy("source/index.d.ts", dst);
	make.augment(dst + "index.d.ts", {
		above: [
			`/// <reference types="reflex-core" />`,
			`/// <reference types="reflex-ml" />`,
		].join("\n")
	});
});

make.on("publish", async () => 
{
	make.publish({
		packageFileChanges: {
			// Reflex ML only has a dependency on Reflex Core
			// when it's used from the npm module. When it's
			// drawn in via a script tag, this reflex.js file will have
			// the core built into it.
			dependencies: make.npm.latestOf(["reflex-core", "reflex-ml"])
		}
	});
});
