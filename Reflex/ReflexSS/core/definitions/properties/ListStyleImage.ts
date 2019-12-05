
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`list-style-image`** CSS property sets an image to be used as the list item marker.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style-image
		 */
		listStyleImage(...values: CssValue[]): Command;
		/**
		 * The **`list-style-image`** CSS property sets an image to be used as the list item marker.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style-image
		 */
		listStyleImage(...values: CssValue[][]): Command;
	}
}
