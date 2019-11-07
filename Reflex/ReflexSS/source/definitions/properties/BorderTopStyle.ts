
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-top-style`** CSS property sets the line style of an element's top `border`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-top-style
		 */
		borderTopStyle(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-top-style`** CSS property sets the line style of an element's top `border`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-top-style
		 */
		borderTopStyle(values: CssValue[][]): Command;
	}
}
