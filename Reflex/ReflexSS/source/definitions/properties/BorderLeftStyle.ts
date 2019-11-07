
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-left-style`** CSS property sets the line style of an element's left `border`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-left-style
		 */
		borderLeftStyle(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-left-style`** CSS property sets the line style of an element's left `border`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-left-style
		 */
		borderLeftStyle(values: CssValue[][]): Command;
	}
}
