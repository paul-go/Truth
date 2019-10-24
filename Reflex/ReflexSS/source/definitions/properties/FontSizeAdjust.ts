
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-size-adjust`** CSS property sets how the font size should be chosen based on the height of lowercase rather than capital letters.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **54** |  **1**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-size-adjust
		 */
		fontSizeAdjust(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`font-size-adjust`** CSS property sets how the font size should be chosen based on the height of lowercase rather than capital letters.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **54** |  **1**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-size-adjust
		 */
		fontSizeAdjust(values: CssValue[][]): Command;
		/**
		 * The **`font-size-adjust`** CSS property sets how the font size should be chosen based on the height of lowercase rather than capital letters.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **54** |  **1**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-size-adjust
		 */
		"font-size-adjust"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`font-size-adjust`** CSS property sets how the font size should be chosen based on the height of lowercase rather than capital letters.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **54** |  **1**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-size-adjust
		 */
		"font-size-adjust"(values: CssValue[][]): Command;
	}
}
