
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`max-width`** CSS property sets the maximum width of an element. It prevents the used value of the `width` property from becoming larger than the value specified by `max-width`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/max-width
		 */
		maxWidth(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`max-width`** CSS property sets the maximum width of an element. It prevents the used value of the `width` property from becoming larger than the value specified by `max-width`.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/max-width
		 */
		maxWidth(values: CssValue[][]): Command;
	}
}
