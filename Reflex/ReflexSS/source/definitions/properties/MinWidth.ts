
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`min-width`** CSS property sets the minimum width of an element. It prevents the used value of the `width` property from becoming smaller than the value specified for `min-width`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/min-width
		 */
		minWidth(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`min-width`** CSS property sets the minimum width of an element. It prevents the used value of the `width` property from becoming smaller than the value specified for `min-width`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/min-width
		 */
		minWidth(values: CssValue[][]): Command;
		/**
		 * The **`min-width`** CSS property sets the minimum width of an element. It prevents the used value of the `width` property from becoming smaller than the value specified for `min-width`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/min-width
		 */
		"min-width"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`min-width`** CSS property sets the minimum width of an element. It prevents the used value of the `width` property from becoming smaller than the value specified for `min-width`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/min-width
		 */
		"min-width"(values: CssValue[][]): Command;
	}
}
