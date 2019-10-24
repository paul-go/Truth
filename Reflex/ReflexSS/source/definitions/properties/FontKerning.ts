
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-kerning`** CSS property sets the use of the kerning information stored in a font.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |    Chrome    | Firefox | Safari | Edge | IE  |
		 * | :----------: | :-----: | :----: | :--: | :-: |
		 * | **32** _-x-_ | **32**  | **7**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-kerning
		 */
		fontKerning(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`font-kerning`** CSS property sets the use of the kerning information stored in a font.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |    Chrome    | Firefox | Safari | Edge | IE  |
		 * | :----------: | :-----: | :----: | :--: | :-: |
		 * | **32** _-x-_ | **32**  | **7**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-kerning
		 */
		fontKerning(values: CssValue[][]): Command;
		/**
		 * The **`font-kerning`** CSS property sets the use of the kerning information stored in a font.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |    Chrome    | Firefox | Safari | Edge | IE  |
		 * | :----------: | :-----: | :----: | :--: | :-: |
		 * | **32** _-x-_ | **32**  | **7**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-kerning
		 */
		"font-kerning"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`font-kerning`** CSS property sets the use of the kerning information stored in a font.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |    Chrome    | Firefox | Safari | Edge | IE  |
		 * | :----------: | :-----: | :----: | :--: | :-: |
		 * | **32** _-x-_ | **32**  | **7**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-kerning
		 */
		"font-kerning"(values: CssValue[][]): Command;
	}
}
