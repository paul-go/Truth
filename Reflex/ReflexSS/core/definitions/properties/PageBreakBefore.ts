
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`page-break-before`** CSS property adjusts page breaks _before_ the current element.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/page-break-before
		 */
		pageBreakBefore(...values: CssValue[]): Command;
		/**
		 * The **`page-break-before`** CSS property adjusts page breaks _before_ the current element.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/page-break-before
		 */
		pageBreakBefore(...values: CssValue[][]): Command;
	}
}
