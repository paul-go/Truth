
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`column-width`** CSS property specifies the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **50**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 1.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-width
		 */
		columnWidth(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`column-width`** CSS property specifies the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **50**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 1.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-width
		 */
		columnWidth(values: CssValue[][]): Call;
		/**
		 * The **`column-width`** CSS property specifies the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **50**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 1.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-width
		 */
		"column-width"(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`column-width`** CSS property specifies the ideal column width in a multi-column layout. The container will have as many columns as can fit without any of them having a width less than the `column-width` value. If the width of the container is narrower than the specified value, the single column's width will be smaller than the declared column width.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **50**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 1.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-width
		 */
		"column-width"(values: CssValue[][]): Call;
	}
}
