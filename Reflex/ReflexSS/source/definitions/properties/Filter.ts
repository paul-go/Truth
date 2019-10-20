
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`filter`** CSS property applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders.
		 * 
		 * **Initial value**: `none`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  | IE  |
		 * | :------: | :-----: | :-----: | :----: | :-: |
		 * |  **53**  | **35**  | **9.1** | **12** | No  |
		 * | 18 _-x-_ |         | 6 _-x-_ |        |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/filter
		 */
		filter(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`filter`** CSS property applies graphical effects like blur or color shift to an element. Filters are commonly used to adjust the rendering of images, backgrounds, and borders.
		 * 
		 * **Initial value**: `none`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  | IE  |
		 * | :------: | :-----: | :-----: | :----: | :-: |
		 * |  **53**  | **35**  | **9.1** | **12** | No  |
		 * | 18 _-x-_ |         | 6 _-x-_ |        |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/filter
		 */
		filter(values: CssValue[][]): Call;
	}
}
