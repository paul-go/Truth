
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-right-width`** CSS property sets the width of the right border of an element.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-right-width
		 */
		borderRightWidth(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-right-width`** CSS property sets the width of the right border of an element.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-right-width
		 */
		borderRightWidth(values: CssValue[][]): Command;
	}
}
