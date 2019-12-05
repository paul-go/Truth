
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`white-space`** CSS property sets how white space inside an element is handled.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/white-space
		 */
		whiteSpace(...values: CssValue[]): Command;
		/**
		 * The **`white-space`** CSS property sets how white space inside an element is handled.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE    |
		 * | :----: | :-----: | :----: | :----: | :-----: |
		 * | **1**  |  **1**  | **1**  | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/white-space
		 */
		whiteSpace(...values: CssValue[][]): Command;
	}
}
