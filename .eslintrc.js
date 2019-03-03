module.exports = {
	
	// http://eslint.org/docs/rules/
	
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": 2017,
		"sourceType": "module"
	},
	"plugins": [
		"@typescript-eslint/eslint-plugin"
	],
	
	"rules": {
		"getter-return": [2],
		"no-async-promise-executor": [2],
		"no-compare-neg-zero": [2],
		"no-cond-assign": [2],
		"no-duplicate-case": [2],
		"no-empty": [2, { "allowEmptyCatch": true }],
		"no-empty-character-class": [2],
		"no-ex-assign": [2],
		"no-extra-boolean-cast": [2],
		"no-extra-parens": [2],
		"no-extra-semi": [2],
		"no-invalid-regexp": [2],
		"no-irregular-whitespace": [2],
		"no-obj-calls": [2],
		"no-prototype-builtins": [2],
		"no-regex-spaces": [2],
		"no-sparse-arrays": [2],
		"no-unreachable": [2],
		"no-unsafe-finally": [2],
		"require-atomic-updates": [2],
		"valid-typeof": [2],
		"dot-location": [2, "property"],
		"dot-notation": [2],
		"eqeqeq": [2],
		"guard-for-in": [2],
		"no-case-declarations": [2],
		"no-alert": [2],
		"no-caller": [2],
		"no-extend-native": [2],
		"no-else-return": [2],
		"no-empty-pattern": [2],
		"no-eval": [2],
		"no-extra-bind": [2],
		"no-extra-label": [2],
		"no-fallthrough": [2],
		"no-floating-decimal": [2],
		"no-global-assign": [2],
		"no-implicit-coercion": [2, { "allow": ["!!", "+"] }],
		"no-implied-eval": [2],
		"no-invalid-this": [2],
		"no-iterator": [2],
		"no-lone-blocks": [2],
		"no-multi-spaces": [2],
		"no-new-func": [2],
		"no-new-wrappers": [2],
		"no-octal-escape": [2],
		"no-param-reassign": [2],
		"no-proto": [2],
		"no-self-assign": [2],
		"no-sequences": [2],
		"no-throw-literal": [2],
		"no-unused-labels": [2],
		"no-useless-call": [2],
		"no-useless-concat": [2],
		"no-useless-return": [2],
		"no-with": [2],
		"prefer-promise-reject-errors": [2],
		"radix": [2],
		"require-await": [2],
		"wrap-iife": [2],
		"no-delete-var": [2],
		"no-label-var": [2],
		"no-undef-init": [2],
		"no-buffer-constructor": [2],
		"no-process-exit": [2],
		"array-bracket-newline": [2, { "multiline": true }],
		"array-bracket-spacing": [2, "never"],
		"block-spacing": [2, "always"],
		"brace-style": [2, "allman", { "allowSingleLine": true }],
		"camelcase": [2, { "properties": "always" }],
		"comma-dangle": [2, "never"],
		"comma-spacing": [2, { "before": false, "after": true }],
		"comma-style": [2, "last"],
		"computed-property-spacing": [2, "never"],
		"eol-last": [2, "always"],
		"func-call-spacing": [2, "never"],
		"func-name-matching": [2, "always"],
		"func-style": [2, "declaration", { "allowArrowFunctions": true }],
		"id-blacklist": [2, "err"],
		"indent": [2, "tab", {
			"MemberExpression": 1,
			"SwitchCase": 1,
			"flatTernaryExpressions": true
		}],
		"jsx-quotes": [2, "prefer-double"],
		"key-spacing": [2, {
			"beforeColon": false,
			"afterColon": true,
			"mode": "strict"
		}],
		"keyword-spacing": [2],
		"line-comment-position": [2, "above"],
		"linebreak-style": [2, "unix"],
		"new-cap": [2, {
			"capIsNewExceptions": ["BigInt"]
		}],
		"new-parens": [2],
		"no-array-constructor": [2],
		"no-inline-comments": [2],
		"no-lonely-if": [2],
		"no-mixed-spaces-and-tabs": [2],
		"no-multi-assign": [2],
		"no-multiple-empty-lines": [2],
		"no-new-object": [2],
		"no-restricted-syntax": [2, "ForInStatement"],
		"no-unneeded-ternary": [2],
		"no-whitespace-before-property": [2],
		"object-curly-newline": ["error", {
			"ImportDeclaration": "never",
			"ExportDeclaration": { "multiline": true, "minProperties": 3 }
		}],
		"object-curly-spacing": [2, "always"],
		"operator-assignment": [2, "always"],
		"operator-linebreak": [2, "after"],
		"padded-blocks": [2, "never"],
		"prefer-object-spread": [2],
		"quote-props": [2, "consistent-as-needed"],
		"quotes": [2, "double", {
			"avoidEscape": true,
			"allowTemplateLiterals": true
		}],
		"semi": [2],
		"semi-spacing": [2, { "before": false, "after": true }],
		"space-before-function-paren": [2, {
			"anonymous": "never",
			"named": "never",
			"asyncArrow": "always"
		}],
		"space-in-parens": [2, "never"],
		"space-infix-ops": [2],
		"space-unary-ops": [2, {
			"words": true,
			"nonwords": false
		}],
		"switch-colon-spacing": [2, {
			"before": false,
			"after": true
		}],
		"template-tag-spacing": [2, "never"],
		
		"generator-star-spacing": [2, {
			"before": true,
			"after": false
		}],
		"no-var": [2],
		"prefer-arrow-callback": [2, {
			"allowNamedFunctions": true
		}],
		"prefer-const": [2],
		"prefer-rest-params": [2],
		"prefer-spread": [2],
		"rest-spread-spacing": [2],
		"template-curly-spacing": [2, "never"],
		"yield-star-spacing": [2, {
			"before": true,
			"after": false
		}],
		"yoda": [2, "never"],
		
		//# TypeScript-specific rules
		
		"@typescript-eslint/adjacent-overload-signatures": [2],
		"@typescript-eslint/ban-types": [2, {
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
		"@typescript-eslint/class-name-casing": [2],
		"@typescript-eslint/member-delimiter-style": [2, {
			"multiline": {
				"delimiter": "semi",
				"requireLast": true
			},
			"singleline": {
				"delimiter": "semi",
				"requireLast": false
			}
		}],
		"@typescript-eslint/no-misused-new": [2],
		"@typescript-eslint/no-triple-slash-reference": [2],
		"@typescript-eslint/prefer-namespace-keyword": [2],
		"@typescript-eslint/type-annotation-spacing": [2, {
			"before": false,
			"after": true,
			"overrides": {
				"arrow": {
					"before": true,
					"after": true
				}
			}
		}]
	}
}
