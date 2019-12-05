
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`flex-basis`** CSS property sets the initial main size of a flex item. It sets the size of the content box unless otherwise set with `box-sizing`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :------: | :-----: | :-----: | :----: | :----: |
		 * |  **29**  | **22**  |  **9**  | **12** | **11** |
		 * | 21 _-x-_ |         | 7 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-basis
		 */
		flexBasis(...values: CssValue[]): Command;
		/**
		 * The **`flex-basis`** CSS property sets the initial main size of a flex item. It sets the size of the content box unless otherwise set with `box-sizing`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * |  Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :------: | :-----: | :-----: | :----: | :----: |
		 * |  **29**  | **22**  |  **9**  | **12** | **11** |
		 * | 21 _-x-_ |         | 7 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/flex-basis
		 */
		flexBasis(...values: CssValue[][]): Command;
	}
}
