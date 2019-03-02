module.exports = {
	
	// http://eslint.org/docs/rules/
	
	"ecmaFeatures": {
		"binaryLiterals": false,
		"blockBindings": false,
		"defaultParams": false,
		"forOf": false,
		"generators": false,
		"objectLiteralComputedProperties": false,
		"objectLiteralDuplicateProperties": false,
		"objectLiteralShorthandMethods": false,
		"objectLiteralShorthandProperties": false,
		"octalLiterals": false,
		"regexUFlag": false,
		"regexYFlag": false,
		"templateStrings": false,
		"unicodeCodePointEscapes": false,
		"jsx": false
	},
	
	"env": {
		"browser": false,
		"node": false,
		"amd": false,
		"mocha": false,
		"jasmine": false,
		"phantomjs": false,
		"jquery": false,
		"prototypejs": false,
		"shelljs": false,
	},
	
	"globals": {
		// e.g. "angular": true
	},
	
	"parserOptions": {
		
	},
	
	"plugins": [
		// e.g. "react" (must run `npm install eslint-plugin-react` first)
		"@typescript-eslint/eslint-plugin"
	],
	
	"rules": {
		//# Possible Errors
		
		"no-comma-dangle": 0,
		"no-cond-assign": 0,
		"no-console": 0,
		"no-constant-condition": 0,
		"no-control-regex": 0,
		"no-debugger": 0,
		"no-dupe-keys": 0,
		"no-empty": 0,
		"no-empty-class": 0,
		"no-ex-assign": 0,
		"no-extra-boolean-cast": 0,
		"no-extra-parens": 0,
		"no-extra-semi": 0,
		"no-func-assign": 0,
		"no-inner-declarations": 0,
		"no-invalid-regexp": 0,
		"no-irregular-whitespace": 0,
		"no-negated-in-lhs": 0,
		"no-obj-calls": 0,
		"no-regex-spaces": 0,
		"no-reserved-keys": 0,
		"no-sparse-arrays": 0,
		"no-unreachable": 0,
		"use-isnan": 0,
		"valid-jsdoc": 0,
		"valid-typeof": 0,
		
		//# Best Practices
		
		"block-scoped-var": 0,
		"complexity": 0,
		"consistent-return": 0,
		"curly": 0,
		"default-case": 0,
		"dot-notation": 0,
		"eqeqeq": 0,
		"guard-for-in": 0,
		"no-alert": 0,
		"no-caller": 0,
		"no-div-regex": 0,
		"no-else-return": 0,
		"no-empty-label": 0,
		"no-eq-null": 0,
		"no-eval": 0,
		"no-extend-native": 0,
		"no-extra-bind": 0,
		"no-fallthrough": 0,
		"no-floating-decimal": 0,
		"no-implied-eval": 0,
		"no-iterator": 0,
		"no-labels": 0,
		"no-lone-blocks": 0,
		"no-loop-func": 0,
		"no-multi-spaces": 0,
		"no-multi-str": 0,
		"no-native-reassign": 0,
		"no-new": 0,
		"no-new-func": 0,
		"no-new-wrappers": 0,
		"no-octal": 0,
		"no-octal-escape": 0,
		"no-process-env": 0,
		"no-proto": 0,
		"no-redeclare": 0,
		"no-return-assign": 0,
		"no-script-url": 0,
		"no-self-compare": 0,
		"no-sequences": 0,
		"no-unused-expressions": 0,
		"no-void": 0,
		"no-warning-comments": 0,
		"no-with": 0,
		"radix": 0,
		"vars-on-top": 0,
		"wrap-iife": 0,
		"yoda": 0,
		
		//# Strict Mode

		"global-strict": 0,
		"no-extra-strict": 0,
		"strict": 0,
		
		//# Variables
		
		"no-catch-shadow": 0,
		"no-delete-var": 0,
		"no-label-var": 0,
		"no-shadow": 0,
		"no-shadow-restricted-names": 0,
		"no-undef": 0,
		"no-undef-init": 0,
		"no-undefined": 0,
		"no-unused-vars": 0,
		"no-use-before-define": 0,
		
		//# Node.js
		
		"handle-callback-err": 0,
		"no-mixed-requires": 0,
		"no-new-require": 0,
		"no-path-concat": 0,
		"no-process-exit": 0,
		"no-restricted-modules": 0,
		"no-sync": 0,
		
		//# Stylistic Issues

		"brace-style": 0,
		"camelcase": 0,
		"comma-spacing": 0,
		"comma-style": 0,
		"consistent-this": 0,
		"eol-last": 0,
		"func-names": 0,
		"func-style": 0,
		"key-spacing": 0,
		"max-nested-callbacks": 0,
		"new-cap": 0,
		"new-parens": 0,
		"no-array-constructor": 0,
		"no-inline-comments": 0,
		"no-lonely-if": 0,
		"no-mixed-spaces-and-tabs": 0,
		"no-multiple-empty-lines": 2,
		"no-nested-ternary": 0,
		"no-new-object": 0,
		"no-space-before-semi": 0,
		"no-spaced-func": 0,
		"no-ternary": 0,
		"no-trailing-spaces": 0,
		"no-underscore-dangle": 0,
		"no-wrap-func": 0,
		"one-var": 0,
		"operator-assignment": 0,
		"padded-blocks": 0,
		"quote-props": 0,
		"quotes": 0,
		"semi": 0,
		"sort-vars": 0,
		"space-after-function-name": 0,
		"space-after-keywords": 0,
		"space-before-blocks": 0,
		"space-in-brackets": 0,
		"space-in-parens": 0,
		"space-infix-ops": 0,
		"space-return-throw-case": 0,
		"space-unary-ops": 0,
		"spaced-line-comment": 0,
		"wrap-regex": 0,
		
		//# ECMAScript 6
		
		"no-var": 0,
		"generator-star": 0,
		
		//# Legacy
		
		"max-depth": 0,
		"max-len": 0,
		"max-params": 0,
		"max-statements": 0,
		"no-bitwise": 0,
		"no-plusplus": 0
	}
}
