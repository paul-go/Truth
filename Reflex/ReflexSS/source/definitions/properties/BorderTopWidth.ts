
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-top-width`** CSS property sets the width of the top border of an element.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-top-width
		 */
		borderTopWidth(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-top-width`** CSS property sets the width of the top border of an element.
		 * 
		 * **Initial value**: `medium`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-top-width
		 */
		borderTopWidth(values: CssValue[][]): Command;
	}
}
