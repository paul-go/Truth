
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`column-count`** CSS property breaks an element's content into the specified number of columns.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 1.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-count
		 */
		columnCount(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-count`** CSS property breaks an element's content into the specified number of columns.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 1.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-count
		 */
		columnCount(values: CssValue[][]): Command;
	}
}
