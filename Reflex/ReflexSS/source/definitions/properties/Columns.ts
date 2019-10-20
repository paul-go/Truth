
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`columns`** CSS property sets the column width and column count of an element.
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE   |
		 * | :----: | :-----: | :-----: | :----: | :----: |
		 * | **50** | **52**  |  **9**  | **12** | **10** |
		 * |        | 9 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/columns
		 */
		columns(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`columns`** CSS property sets the column width and column count of an element.
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE   |
		 * | :----: | :-----: | :-----: | :----: | :----: |
		 * | **50** | **52**  |  **9**  | **12** | **10** |
		 * |        | 9 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/columns
		 */
		columns(values: CssValue[][]): Call;
	}
}
