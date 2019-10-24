
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`vertical-align`** CSS property sets vertical alignment of an inline or table-cell box.
		 * 
		 * **Initial value**: `baseline`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/vertical-align
		 */
		verticalAlign(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`vertical-align`** CSS property sets vertical alignment of an inline or table-cell box.
		 * 
		 * **Initial value**: `baseline`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/vertical-align
		 */
		verticalAlign(values: CssValue[][]): Command;
		/**
		 * The **`vertical-align`** CSS property sets vertical alignment of an inline or table-cell box.
		 * 
		 * **Initial value**: `baseline`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/vertical-align
		 */
		"vertical-align"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`vertical-align`** CSS property sets vertical alignment of an inline or table-cell box.
		 * 
		 * **Initial value**: `baseline`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/vertical-align
		 */
		"vertical-align"(values: CssValue[][]): Command;
	}
}
