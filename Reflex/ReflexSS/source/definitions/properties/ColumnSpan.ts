
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`column-span`** CSS property makes it possible for an element to span across all columns when its value is set to `all`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **50**  |   n/a   |   **9**   | **12** | **10** |
		 * | 6 _-x-_ |         | 5.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-span
		 */
		columnSpan(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-span`** CSS property makes it possible for an element to span across all columns when its value is set to `all`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **50**  |   n/a   |   **9**   | **12** | **10** |
		 * | 6 _-x-_ |         | 5.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-span
		 */
		columnSpan(values: CssValue[][]): Command;
		/**
		 * The **`column-span`** CSS property makes it possible for an element to span across all columns when its value is set to `all`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **50**  |   n/a   |   **9**   | **12** | **10** |
		 * | 6 _-x-_ |         | 5.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-span
		 */
		"column-span"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-span`** CSS property makes it possible for an element to span across all columns when its value is set to `all`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **50**  |   n/a   |   **9**   | **12** | **10** |
		 * | 6 _-x-_ |         | 5.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-span
		 */
		"column-span"(values: CssValue[][]): Command;
	}
}
