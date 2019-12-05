
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-bottom-left-radius`** CSS property rounds the bottom-left corner of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * |  **4**  |  **4**  |  **5**  | **12** | **9** |
		 * | 1 _-x-_ |         | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-left-radius
		 */
		borderBottomLeftRadius(...values: CssValue[]): Command;
		/**
		 * The **`border-bottom-left-radius`** CSS property rounds the bottom-left corner of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * |  **4**  |  **4**  |  **5**  | **12** | **9** |
		 * | 1 _-x-_ |         | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-bottom-left-radius
		 */
		borderBottomLeftRadius(...values: CssValue[][]): Command;
	}
}
