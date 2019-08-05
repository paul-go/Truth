module.exports = {
	
	// http://eslint.org/docs/rules/
	
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 2017,
		"sourceType": "module"
	},
	"plugins": [
		"@typescript-eslint/eslint-plugin",
		"filenames"
	],
	
	"rules": {
		"getter-return": [1],
		"no-async-promise-executor": [1],
		"no-compare-neg-zero": [1],
		"no-cond-assign": [1],
		"no-duplicate-case": [1],
		"no-empty": [1, { "allowEmptyCatch": true }],
		"no-empty-character-class": [1],
		"no-ex-assign": [1],
		"no-extra-boolean-cast": [1],
		"no-extra-parens": [1],
		"no-extra-semi": [1],
		"no-invalid-regexp": [1],
		"no-irregular-whitespace": [1],
		"no-obj-calls": [1],
		"no-prototype-builtins": [1],
		"no-regex-spaces": [1],
		"no-sparse-arrays": [1],
		"no-unreachable": [1],
		"no-unsafe-finally": [1],
		"require-atomic-updates": [1],
		"valid-typeof": [1],
		"dot-location": [1, "property"],
		"dot-notation": [1],
		"eqeqeq": [1],
		"guard-for-in": [1],
		"no-case-declarations": [1],
		"no-alert": [1],
		"no-caller": [1],
		"no-extend-native": [1],
		"no-else-return": [1],
		"no-empty-pattern": [1],
		"no-eval": [1],
		"no-extra-bind": [1],
		"no-extra-label": [1],
		"no-fallthrough": [1],
		"no-floating-decimal": [1],
		"no-global-assign": [1],
		"no-implicit-coercion": [1, { "allow": ["!!", "+"] }],
		"no-implied-eval": [1],
		"no-invalid-this": [1],
		"no-iterator": [1],
		"no-lone-blocks": [1],
		"no-multi-spaces": [1],
		"no-new-func": [1],
		"no-new-wrappers": [1],
		"no-octal-escape": [1],
		"no-param-reassign": [1],
		"no-proto": [1],
		"no-self-assign": [1],
		"no-sequences": [1],
		"no-throw-literal": [1],
		"no-unused-labels": [1],
		"no-useless-call": [1],
		"no-useless-concat": [1],
		"no-useless-return": [1],
		"no-with": [1],
		"prefer-promise-reject-errors": [1],
		"radix": [1],
		"require-await": [1],
		"wrap-iife": [1],
		"no-delete-var": [1],
		"no-label-var": [1],
		"no-undef-init": [1],
		"no-buffer-constructor": [1],
		"no-process-exit": [1],
		"array-bracket-newline": [1, { "multiline": true }],
		"array-bracket-spacing": [1, "never"],
		"block-spacing": [1, "always"],
		"brace-style": [1, "allman", { "allowSingleLine": true }],
		"camelcase": [1, { "properties": "always" }],
		"comma-dangle": [1, "never"],
		"comma-spacing": [1, { "before": false, "after": true }],
		"comma-style": [1, "last"],
		"computed-property-spacing": [1, "never"],
		"eol-last": [1, "always"],
		"func-call-spacing": [1, "never"],
		"func-name-matching": [1, "always"],
		"func-style": [1, "declaration", { "allowArrowFunctions": true }],
		"id-blacklist": [1, "err"],
		"indent": [1, "tab", {
			"MemberExpression": 1,
			"SwitchCase": 1,
			"flatTernaryExpressions": true
		}],
		"jsx-quotes": [1, "prefer-double"],
		"key-spacing": [1, {
			"beforeColon": false,
			"afterColon": true,
			"mode": "strict"
		}],
		"keyword-spacing": [1],
		"line-comment-position": [1, "above"],
		"linebreak-style": [1, "unix"],
		"new-cap": [1, {
			"capIsNewExceptions": ["BigInt"]
		}],
		"new-parens": [1],
		"no-array-constructor": [1],
		"no-inline-comments": [1],
		"no-lonely-if": [1],
		"no-mixed-spaces-and-tabs": [1],
		"no-multi-assign": [1],
		"no-multiple-empty-lines": [1],
		"no-new-object": [1],
		"no-restricted-syntax": [1, "ForInStatement"],
		"no-unneeded-ternary": [1],
		"no-whitespace-before-property": [1],
		"object-curly-newline": ["error", {
			"ImportDeclaration": "never",
			"ExportDeclaration": { "multiline": true, "minProperties": 3 }
		}],
		"object-curly-spacing": [1, "always"],
		"operator-assignment": [1, "always"],
		"operator-linebreak": [1, "after"],
		"padded-blocks": [1, "never"],
		"prefer-object-spread": [1],
		"quote-props": [1, "consistent-as-needed"],
		"quotes": [1, "double", {
			"avoidEscape": true,
			"allowTemplateLiterals": true
		}],
		"semi": [1],
		"semi-spacing": [1, { "before": false, "after": true }],
		"space-before-function-paren": [1, {
			"anonymous": "never",
			"named": "never",
			"asyncArrow": "always"
		}],
		"space-in-parens": [1, "never"],
		"space-infix-ops": [1],
		"space-unary-ops": [1, {
			"words": true,
			"nonwords": false
		}],
		"switch-colon-spacing": [1, {
			"before": false,
			"after": true
		}],
		"template-tag-spacing": [1, "never"],
		
		"generator-star-spacing": [1, {
			"before": true,
			"after": false
		}],
		"no-var": [1],
		"prefer-arrow-callback": [1, {
			"allowNamedFunctions": true
		}],
		"prefer-const": [1],
		"prefer-rest-params": [1],
		"prefer-spread": [1],
		"rest-spread-spacing": [1],
		"template-curly-spacing": [1, "never"],
		"yield-star-spacing": [1, {
			"before": true,
			"after": false
		}],
		"yoda": [1, "never"],
		
		//# TypeScript-specific rules
		
		"@typescript-eslint/adjacent-overload-signatures": [1],
		"@typescript-eslint/ban-types": [1, {
			"types": {
				"Object": {
					"message": "Use {} instead",
					"fixWith": "{}"
				},
				"String": {
					"message": "Use string instead",
					"fixWith": "string"
				},
				"Number": {
					"message": "Use number instead",
					"fixWith": "number"
				},
				"Boolean": {
					"message": "Use boolean instead",
					"fixWith": "boolean"
				}
			}
		}],
		"@typescript-eslint/class-name-casing": [1],
		"@typescript-eslint/member-delimiter-style": [1, {
			"multiline": {
				"delimiter": "semi",
				"requireLast": true
			},
			"singleline": {
				"delimiter": "semi",
				"requireLast": false
			}
		}],
		"@typescript-eslint/no-misused-new": [1],
		"@typescript-eslint/no-triple-slash-reference": [1],
		"@typescript-eslint/prefer-namespace-keyword": [1],
		"@typescript-eslint/type-annotation-spacing": [1, {
			"before": false,
			"after": true,
			"overrides": {
				"arrow": {
					"before": true,
					"after": true
				}
			}
		}],
		
		//# File name plugin
		
		"filenames/match-regex": [1, "^(([A-Z])|([A-Z][a-z]+([A-Z][a-z]+)*))$"]
	}
}
