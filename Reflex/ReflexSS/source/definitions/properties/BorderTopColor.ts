
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-top-color`** CSS property sets the color of an element's top border. It can also be set with the shorthand CSS properties `border-color` or `border-top`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-top-color
		 */
		borderTopColor(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-top-color`** CSS property sets the color of an element's top border. It can also be set with the shorthand CSS properties `border-color` or `border-top`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-top-color
		 */
		borderTopColor(values: CssValue[][]): Command;
	}
}
