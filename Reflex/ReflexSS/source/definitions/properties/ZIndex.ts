
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`z-index`** CSS property sets the z-order of a positioned element and its descendants or flex items. Overlapping elements with a larger z-index cover those with a smaller one.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/z-index
		 */
		zIndex(...values: CssValue[]): Command;
		/**
		 * The **`z-index`** CSS property sets the z-order of a positioned element and its descendants or flex items. Overlapping elements with a larger z-index cover those with a smaller one.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/z-index
		 */
		zIndex(...values: CssValue[][]): Command;
	}
}
