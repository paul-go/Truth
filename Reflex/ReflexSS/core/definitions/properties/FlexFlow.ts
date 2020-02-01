
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`flex-flow`** CSS property is a shorthand property for `flex-direction` and `flex-wrap` properties.
		 * 
		 * |  Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :------: | :-----: | :-------: | :----: | :----: |
		 * |  **29**  | **28**  |   **9**   | **12** | **11** |
		 * | 21 _-x-_ |         | 6.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-flow
		 */
		flexFlow(...values: CssValue[]): Command;
		/**
		 * The **`flex-flow`** CSS property is a shorthand property for `flex-direction` and `flex-wrap` properties.
		 * 
		 * |  Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :------: | :-----: | :-------: | :----: | :----: |
		 * |  **29**  | **28**  |   **9**   | **12** | **11** |
		 * | 21 _-x-_ |         | 6.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-flow
		 */
		flexFlow(...values: CssValue[][]): Command;
	}
}
