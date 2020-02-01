
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`flex`** CSS property sets how a flex item will grow or shrink to fit the space available in its flex container. It is a shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`.
		 * 
		 * |  Chrome  | Firefox |  Safari   |  Edge  |    IE    |
		 * | :------: | :-----: | :-------: | :----: | :------: |
		 * |  **29**  | **20**  |   **9**   | **12** |  **11**  |
		 * | 21 _-x-_ |         | 6.1 _-x-_ |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex
		 */
		flex(...values: CssValue[]): Command;
		/**
		 * The **`flex`** CSS property sets how a flex item will grow or shrink to fit the space available in its flex container. It is a shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`.
		 * 
		 * |  Chrome  | Firefox |  Safari   |  Edge  |    IE    |
		 * | :------: | :-----: | :-------: | :----: | :------: |
		 * |  **29**  | **20**  |   **9**   | **12** |  **11**  |
		 * | 21 _-x-_ |         | 6.1 _-x-_ |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex
		 */
		flex(...values: CssValue[][]): Command;
	}
}
