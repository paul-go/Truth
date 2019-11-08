
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`padding-left`** CSS property sets the width of the padding area on the left side of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-left
		 */
		paddingLeft(...values: CssValue[]): Command;
		/**
		 * The **`padding-left`** CSS property sets the width of the padding area on the left side of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-left
		 */
		paddingLeft(...values: CssValue[][]): Command;
	}
}
