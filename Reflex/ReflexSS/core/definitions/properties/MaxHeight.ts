
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`max-height`** CSS property sets the maximum height of an element. It prevents the used value of the `height` property from becoming larger than the value specified for `max-height`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **18** |  **1**  | **1.3** | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/max-height
		 */
		maxHeight(...values: CssValue[]): Command;
		/**
		 * The **`max-height`** CSS property sets the maximum height of an element. It prevents the used value of the `height` property from becoming larger than the value specified for `max-height`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **18** |  **1**  | **1.3** | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/max-height
		 */
		maxHeight(...values: CssValue[][]): Command;
	}
}
