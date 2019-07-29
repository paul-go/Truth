module.exports = {
	"extends": require.resolve("artistry-code-style"),
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	},
	"rules": {
		"no-alert": [0],
		"no-cond-assign": [0],
		"valid-typeof": [0],
		"generator-star-spacing": [0],
		"no-restricted-syntax": [0],
		"@typescript-eslint/no-triple-slash-reference": [0]
	}
}