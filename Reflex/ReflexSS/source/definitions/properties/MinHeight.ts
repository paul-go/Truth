
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`min-height`** CSS property sets the minimum height of an element. It prevents the used value of the `height` property from becoming smaller than the value specified for `min-height`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **3**  | **1.3** | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/min-height
		 */
		minHeight(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`min-height`** CSS property sets the minimum height of an element. It prevents the used value of the `height` property from becoming smaller than the value specified for `min-height`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **3**  | **1.3** | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/min-height
		 */
		minHeight(values: CssValue[][]): Command;
		/**
		 * The **`min-height`** CSS property sets the minimum height of an element. It prevents the used value of the `height` property from becoming smaller than the value specified for `min-height`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **3**  | **1.3** | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/min-height
		 */
		"min-height"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`min-height`** CSS property sets the minimum height of an element. It prevents the used value of the `height` property from becoming smaller than the value specified for `min-height`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |  IE   |
		 * | :----: | :-----: | :-----: | :----: | :---: |
		 * | **1**  |  **3**  | **1.3** | **12** | **7** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/min-height
		 */
		"min-height"(values: CssValue[][]): Command;
	}
}
