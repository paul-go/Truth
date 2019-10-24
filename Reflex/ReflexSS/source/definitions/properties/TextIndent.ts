
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-indent`** CSS property sets the length of empty space (indentation) that is put before lines of text in a block.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-indent
		 */
		textIndent(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-indent`** CSS property sets the length of empty space (indentation) that is put before lines of text in a block.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-indent
		 */
		textIndent(values: CssValue[][]): Command;
		/**
		 * The **`text-indent`** CSS property sets the length of empty space (indentation) that is put before lines of text in a block.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-indent
		 */
		"text-indent"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-indent`** CSS property sets the length of empty space (indentation) that is put before lines of text in a block.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-indent
		 */
		"text-indent"(values: CssValue[][]): Command;
	}
}
