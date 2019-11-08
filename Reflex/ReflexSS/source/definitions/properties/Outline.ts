
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`outline`** CSS property is a shorthand to set various outline properties in a single declaration: `outline-style`, `outline-width`, and `outline-color`.
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  | **1.5** | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/outline
		 */
		outline(...values: CssValue[]): Command;
		/**
		 * The **`outline`** CSS property is a shorthand to set various outline properties in a single declaration: `outline-style`, `outline-width`, and `outline-color`.
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  | **1.5** | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/outline
		 */
		outline(...values: CssValue[][]): Command;
	}
}
