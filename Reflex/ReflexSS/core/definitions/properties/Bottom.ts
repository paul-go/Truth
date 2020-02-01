
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`bottom`** CSS property participates in specifying the vertical position of a _positioned element_. It has no effect on non-positioned elements.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/bottom
		 */
		bottom(...values: CssValue[]): Command;
		/**
		 * The **`bottom`** CSS property participates in specifying the vertical position of a _positioned element_. It has no effect on non-positioned elements.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/bottom
		 */
		bottom(...values: CssValue[][]): Command;
	}
}
