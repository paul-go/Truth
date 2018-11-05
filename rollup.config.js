const CoreDir = "Build/Core/";
const AgentsDir = "Build/CoreAgents/";

export default
[
	// Core
	{
		input: CoreDir + "X.js",
		output: {
			dir: "Build",
			name: "Truth",
			file: "truth.js",
			format: "cjs",
			sourcemap: "inline"
		}
	},
	// Core "use" Agent
	{
		input: AgentsDir + "Use/X.js",
		output: {
			dir: "Build",
			file: "truth-use.js",
			format: "iife",
			name: "_",
			banner: "Truth.use(function(Hooks) {",
			footer: "}",
			sourcemap: "inline"
		}
	},
	// Core "verify" Agent
	{
		input: AgentsDir + "Verify/X.js",
		output: {
			dir: "Build",
			file: "truth-verify.js",
			format: "iife",
			name: "_",
			banner: "Truth.use(function(Hooks) {",
			footer: "}",
			sourcemap: "inline"
		}
	},
	// Core "regex" Agent
	{
		input: AgentsDir + "Regex/X.js",
		output: {
			dir: "Build",
			file: "truth-regex.js",
			format: "iife",
			name: "_",
			banner: "Truth.use(function(Hooks) {",
			footer: "}",
			sourcemap: "inline"
		}
	}
]
