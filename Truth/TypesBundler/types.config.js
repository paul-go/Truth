/**
 * Configuration file for the TypesBundler.
 */

const bundle = require("./TypesBundler.js");
bundle({
	in: "../Build/Core/X.d.ts",
	out: [
		"../CoreAgents/truth.d.ts",
		"../Build/truth.d.ts"
	],
	namespace: "Truth",
	module: "truth-compiler",
	footer: [
		"declare const Hooks: Truth.HookTypesInstance;",
		"declare const Program: Truth.Program;"
	]
});
