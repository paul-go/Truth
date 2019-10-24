
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
		 * 
		 * **Initial value**: `balance`
		 * 
		 * | Chrome | Firefox  | Safari  |  Edge  |   IE   |
		 * | :----: | :------: | :-----: | :----: | :----: |
		 * | **50** |  **52**  |  **9**  | **12** | **10** |
		 * |        | 13 _-x-_ | 8 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-fill
		 */
		columnFill(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
		 * 
		 * **Initial value**: `balance`
		 * 
		 * | Chrome | Firefox  | Safari  |  Edge  |   IE   |
		 * | :----: | :------: | :-----: | :----: | :----: |
		 * | **50** |  **52**  |  **9**  | **12** | **10** |
		 * |        | 13 _-x-_ | 8 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-fill
		 */
		columnFill(values: CssValue[][]): Command;
		/**
		 * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
		 * 
		 * **Initial value**: `balance`
		 * 
		 * | Chrome | Firefox  | Safari  |  Edge  |   IE   |
		 * | :----: | :------: | :-----: | :----: | :----: |
		 * | **50** |  **52**  |  **9**  | **12** | **10** |
		 * |        | 13 _-x-_ | 8 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-fill
		 */
		"column-fill"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-fill`** CSS property controls how an element's contents are balanced when broken into columns.
		 * 
		 * **Initial value**: `balance`
		 * 
		 * | Chrome | Firefox  | Safari  |  Edge  |   IE   |
		 * | :----: | :------: | :-----: | :----: | :----: |
		 * | **50** |  **52**  |  **9**  | **12** | **10** |
		 * |        | 13 _-x-_ | 8 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-fill
		 */
		"column-fill"(values: CssValue[][]): Command;
	}
}
