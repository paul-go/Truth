
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`flex-wrap`** CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.
		 * 
		 * **Initial value**: `nowrap`
		 * 
		 * |  Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :------: | :-----: | :-------: | :----: | :----: |
		 * |  **29**  | **28**  |   **9**   | **12** | **11** |
		 * | 21 _-x-_ |         | 6.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-wrap
		 */
		flexWrap(...values: CssValue[]): Command;
		/**
		 * The **`flex-wrap`** CSS property sets whether flex items are forced onto one line or can wrap onto multiple lines. If wrapping is allowed, it sets the direction that lines are stacked.
		 * 
		 * **Initial value**: `nowrap`
		 * 
		 * |  Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :------: | :-----: | :-------: | :----: | :----: |
		 * |  **29**  | **28**  |   **9**   | **12** | **11** |
		 * | 21 _-x-_ |         | 6.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-wrap
		 */
		flexWrap(...values: CssValue[][]): Command;
	}
}
