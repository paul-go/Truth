
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`outline-offset`** CSS property sets the amount of space between an outline and the edge or border of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :-----: | :----: | :-: |
		 * | **1**  | **1.5** | **1.2** | **15** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/outline-offset
		 */
		outlineOffset(...values: CssValue[]): Command;
		/**
		 * The **`outline-offset`** CSS property sets the amount of space between an outline and the edge or border of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :-----: | :----: | :-: |
		 * | **1**  | **1.5** | **1.2** | **15** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/outline-offset
		 */
		outlineOffset(...values: CssValue[][]): Command;
	}
}
