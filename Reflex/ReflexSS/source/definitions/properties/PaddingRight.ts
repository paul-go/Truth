
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`padding-right`** CSS property sets the width of the padding area on the right side of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-right
		 */
		paddingRight(...values: CssValue[]): Command;
		/**
		 * The **`padding-right`** CSS property sets the width of the padding area on the right side of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-right
		 */
		paddingRight(...values: CssValue[][]): Command;
	}
}
