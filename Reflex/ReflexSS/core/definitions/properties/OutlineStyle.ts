
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`outline-style`** CSS property sets the style of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  | **1.5** | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/outline-style
		 */
		outlineStyle(...values: CssValue[]): Command;
		/**
		 * The **`outline-style`** CSS property sets the style of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  | **1.5** | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/outline-style
		 */
		outlineStyle(...values: CssValue[][]): Command;
	}
}
