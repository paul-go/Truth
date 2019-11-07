
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-color`** shorthand CSS property sets the color of all sides of an element's border.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-color
		 */
		borderColor(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-color`** shorthand CSS property sets the color of all sides of an element's border.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-color
		 */
		borderColor(values: CssValue[][]): Command;
	}
}
