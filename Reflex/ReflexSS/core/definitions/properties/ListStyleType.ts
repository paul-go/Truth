
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`list-style-type`** CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.
		 * 
		 * **Initial value**: `disc`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style-type
		 */
		listStyleType(...values: CssValue[]): Command;
		/**
		 * The **`list-style-type`** CSS property sets the marker (such as a disc, character, or custom counter style) of a list item element.
		 * 
		 * **Initial value**: `disc`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style-type
		 */
		listStyleType(...values: CssValue[][]): Command;
	}
}
