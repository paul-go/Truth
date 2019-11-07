
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-width`** shorthand CSS property sets the widths of all four sides of an element's border.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-width
		 */
		borderWidth(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-width`** shorthand CSS property sets the widths of all four sides of an element's border.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-width
		 */
		borderWidth(values: CssValue[][]): Command;
	}
}
