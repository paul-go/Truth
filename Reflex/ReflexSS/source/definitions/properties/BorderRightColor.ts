
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-right-color`** CSS property sets the color of an element's right border. It can also be set with the shorthand CSS properties `border-color` or `border-right`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-right-color
		 */
		borderRightColor(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-right-color`** CSS property sets the color of an element's right border. It can also be set with the shorthand CSS properties `border-color` or `border-right`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-right-color
		 */
		borderRightColor(values: CssValue[][]): Command;
	}
}
