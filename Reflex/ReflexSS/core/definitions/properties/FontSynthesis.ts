
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-synthesis`** CSS property controls which missing typefaces, bold or italic, may be synthesized by the browser.
		 * 
		 * **Initial value**: `weight style`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **34**  | **9**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-synthesis
		 */
		fontSynthesis(...values: CssValue[]): Command;
		/**
		 * The **`font-synthesis`** CSS property controls which missing typefaces, bold or italic, may be synthesized by the browser.
		 * 
		 * **Initial value**: `weight style`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **34**  | **9**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-synthesis
		 */
		fontSynthesis(...values: CssValue[][]): Command;
	}
}
