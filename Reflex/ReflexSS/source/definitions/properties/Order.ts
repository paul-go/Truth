
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`order`** CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending `order` value and then by their source code order.
		 * 
		 * **Initial value**: `0`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
		 * | :------: | :-----: | :-----: | :----: | :------: |
		 * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
		 * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/order
		 */
		order(...values: CssValue[]): Command;
		/**
		 * The **`order`** CSS property sets the order to lay out an item in a flex or grid container. Items in a container are sorted by ascending `order` value and then by their source code order.
		 * 
		 * **Initial value**: `0`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
		 * | :------: | :-----: | :-----: | :----: | :------: |
		 * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
		 * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/order
		 */
		order(...values: CssValue[][]): Command;
	}
}
