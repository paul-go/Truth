
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`overflow`** CSS property sets what to do when an element's content is too big to fit in its block formatting context. It is a shorthand for `overflow-x` and `overflow-y`.
		 * 
		 * **Initial value**: `visible`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overflow
		 */
		overflow(...values: CssValue[]): Command;
		/**
		 * The **`overflow`** CSS property sets what to do when an element's content is too big to fit in its block formatting context. It is a shorthand for `overflow-x` and `overflow-y`.
		 * 
		 * **Initial value**: `visible`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overflow
		 */
		overflow(...values: CssValue[][]): Command;
	}
}
