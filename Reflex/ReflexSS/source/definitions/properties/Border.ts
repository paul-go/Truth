
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border`** CSS property sets an element's border. It's a shorthand for `border-width`, `border-style`, and `border-color`.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border
		 */
		border(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`border`** CSS property sets an element's border. It's a shorthand for `border-width`, `border-style`, and `border-color`.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border
		 */
		border(values: CssValue[][]): Call;
	}
}
