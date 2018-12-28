
/**
 * This is a configuration file for those who are using WallabyJS,
 * which is a commercial test runner and coverage reporting tool.
 * It can be found at: https://wallabyjs.com/
 */

module.exports = function(wallaby)
{
	return {
		files: [
			"Core/**/*.ts",
      		"CoreTests/**/*.ts",
      		"!CoreTests/**/*test.ts"
		],
		tests: [
			"CoreTests/**/*test.ts"
		],
		compilers: {
			"**/*.ts?(x)": wallaby.compilers.typeScript({
				typeScript: require("typescript"),
			})
      	},
		env: {
			type: "node",
			runner: "node"
		},
		testFramework: "jest"
	}
}
