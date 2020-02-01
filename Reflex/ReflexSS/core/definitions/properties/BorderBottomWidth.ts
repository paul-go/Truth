
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-bottom-width`** CSS property sets the width of the bottom border of a box.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-width
		 */
		borderBottomWidth(...values: CssValue[]): Command;
		/**
		 * The **`border-bottom-width`** CSS property sets the width of the bottom border of a box.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-width
		 */
		borderBottomWidth(...values: CssValue[][]): Command;
	}
}
