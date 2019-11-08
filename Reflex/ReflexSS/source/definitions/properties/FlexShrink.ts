
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`flex-shrink`** CSS property sets the flex shrink factor of a flex item. If the size of flex items is larger than the flex container, items shrink to fit according to `flex-shrink`.
		 * 
		 * **Initial value**: `1`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :------: | :-----: | :-----: | :----: | :----: |
		 * |  **29**  | **20**  |  **9**  | **12** | **10** |
		 * | 21 _-x-_ |         | 8 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-shrink
		 */
		flexShrink(...values: CssValue[]): Command;
		/**
		 * The **`flex-shrink`** CSS property sets the flex shrink factor of a flex item. If the size of flex items is larger than the flex container, items shrink to fit according to `flex-shrink`.
		 * 
		 * **Initial value**: `1`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :------: | :-----: | :-----: | :----: | :----: |
		 * |  **29**  | **20**  |  **9**  | **12** | **10** |
		 * | 21 _-x-_ |         | 8 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-shrink
		 */
		flexShrink(...values: CssValue[][]): Command;
	}
}
