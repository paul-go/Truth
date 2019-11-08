
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`background-image`** CSS property sets one or more background images on an element.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-image
		 */
		backgroundImage(...values: CssValue[]): Command;
		/**
		 * The **`background-image`** CSS property sets one or more background images on an element.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-image
		 */
		backgroundImage(...values: CssValue[][]): Command;
	}
}
