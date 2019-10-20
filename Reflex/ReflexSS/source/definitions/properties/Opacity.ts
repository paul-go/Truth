
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`opacity`** CSS property sets the transparency of an element or the degree to which content behind an element is visible.
		 * 
		 * **Initial value**: `1.0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **2**  | **12** | **9** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/opacity
		 */
		opacity(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`opacity`** CSS property sets the transparency of an element or the degree to which content behind an element is visible.
		 * 
		 * **Initial value**: `1.0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **2**  | **12** | **9** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/opacity
		 */
		opacity(values: CssValue[][]): Call;
	}
}
