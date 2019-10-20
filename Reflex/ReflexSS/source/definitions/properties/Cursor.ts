
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`cursor`** CSS property sets mouse cursor to display when the mouse pointer is over an element.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/cursor
		 */
		cursor(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`cursor`** CSS property sets mouse cursor to display when the mouse pointer is over an element.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **1**  | **1.2** | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/cursor
		 */
		cursor(values: CssValue[][]): Call;
	}
}
