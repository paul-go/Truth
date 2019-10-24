
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
		 * 
		 * **Initial value**: `row`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
		 * | :------: | :-----: | :-----: | :----: | :------: |
		 * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
		 * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-direction
		 */
		flexDirection(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
		 * 
		 * **Initial value**: `row`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
		 * | :------: | :-----: | :-----: | :----: | :------: |
		 * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
		 * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-direction
		 */
		flexDirection(values: CssValue[][]): Command;
		/**
		 * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
		 * 
		 * **Initial value**: `row`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
		 * | :------: | :-----: | :-----: | :----: | :------: |
		 * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
		 * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-direction
		 */
		"flex-direction"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`flex-direction`** CSS property sets how flex items are placed in the flex container defining the main axis and the direction (normal or reversed).
		 * 
		 * **Initial value**: `row`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |    IE    |
		 * | :------: | :-----: | :-----: | :----: | :------: |
		 * |  **29**  | **20**  |  **9**  | **12** |  **11**  |
		 * | 21 _-x-_ |         | 7 _-x-_ |        | 10 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-direction
		 */
		"flex-direction"(values: CssValue[][]): Command;
	}
}
