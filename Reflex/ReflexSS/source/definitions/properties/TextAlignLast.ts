
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-align-last`** CSS property sets how the last line of a block or a line, right before a forced line break, is aligned.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **47** | **49**  |   No   | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-align-last
		 */
		textAlignLast(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-align-last`** CSS property sets how the last line of a block or a line, right before a forced line break, is aligned.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **47** | **49**  |   No   | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-align-last
		 */
		textAlignLast(values: CssValue[][]): Command;
	}
}
