module.exports = {
	"extends": require.resolve("artistry-code-style"),
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	},
	"parserOptions": {
		"project": "./tsconfig.json"
	}
}
