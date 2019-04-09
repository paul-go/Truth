# Artistry Code Style

This repository contains the necessary files required to use the Artistry code style. Most code styles (especially [Prettier](https://prettier.io/)) are designed around the belief that while code formatting is something that should be consistent, it isn't something that programmers should spending time thinking about. This seems to be the generally accepted belief within the programming community.

In one man's humble opinion, this idea is reminiscent of the pre-Apple renaissance era of computing when "UX" wasn't an established term, software aesthetic was considered a superfluous nice-to-have, and the prevailing belief  that "it doesn't matter what it looks like, only that it works".

The Artistry code is was designed around the contrarian idea that code formatting and code beauty *is* something that programmers should spend time thinking about. The aesthetic quality of the code in some ways is as important as the algorithms themselves. Writing code in an environment where code aesthetic is intentional, respected, and sought-after breeds a culture of craftsmanship. When code aesthetic isn't a focal point of the team, it tends to breed a culture of carelessness. And while these teams can deliver code assets that *function*, they tend to be lacking in *thoughtfulness*.


## Contents

This package contains:

- A JavaScript and CSS file that words in tandem with the [VSCode Custom CSS](https://github.com/be5invis/vscode-custom-css) extension. This extension hacks VS Code to allow you to shoehorn in your own code into the internal Monaco code editor. 
- The `Open Sans Code` font, which is a derivation of the `Open Sans'.
- ESLint rules

## Usage

The default export contains all of our ESLint rules.

**It requires:**

* [eslint@4.14.0](https://github.com/eslint/eslint)

```
npm install artistry-code-style --save-dev
```

After installing, you'll need to include a `.eslintrc.js` file in the root directory of your project that contains the following code:

```javascript
module.exports = {
	"extends": require.resolve("artistry-code-style"),
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	}
}
```

## Development

This repository is under active development, as we're always adding new ESLint rules. Here are some helpful resources to get started building customer ESLint rules:

https://www.kenneth-truyers.net/2016/05/27/writing-custom-eslint-rules/
https://flexport.engineering/writing-custom-lint-rules-for-your-picky-developers-67732afa1803
https://insideops.wordpress.com/2015/12/08/creating-custom-rules-for-eslint/
