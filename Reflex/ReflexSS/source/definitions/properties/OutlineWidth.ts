
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`outline-width`** CSS property sets the thickness of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  | **1.5** | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/outline-width
		 */
		outlineWidth(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`outline-width`** CSS property sets the thickness of an element's outline. An outline is a line that is drawn around an element, outside the `border`.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  | **1.5** | **1.2** | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/outline-width
		 */
		outlineWidth(values: CssValue[][]): Command;
	}
}
