
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-language-override`** CSS property controls the use of language-specific glyphs in a typeface.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **34**  |   No   |  No  | No  |
		 * |        | 4 _-x-_ |        |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-language-override
		 */
		fontLanguageOverride(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`font-language-override`** CSS property controls the use of language-specific glyphs in a typeface.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **34**  |   No   |  No  | No  |
		 * |        | 4 _-x-_ |        |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-language-override
		 */
		fontLanguageOverride(values: CssValue[][]): Command;
	}
}
