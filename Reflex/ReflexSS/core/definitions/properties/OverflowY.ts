
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`overflow-y`** CSS property sets what shows when content overflows a block-level element's top and bottom edges. This may be nothing, a scroll bar, or the overflow content.
		 * 
		 * **Initial value**: `visible`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  | **1.5** | **3**  | **12** | **5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overflow-y
		 */
		overflowY(...values: CssValue[]): Command;
		/**
		 * The **`overflow-y`** CSS property sets what shows when content overflows a block-level element's top and bottom edges. This may be nothing, a scroll bar, or the overflow content.
		 * 
		 * **Initial value**: `visible`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  | **1.5** | **3**  | **12** | **5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overflow-y
		 */
		overflowY(...values: CssValue[][]): Command;
	}
}
