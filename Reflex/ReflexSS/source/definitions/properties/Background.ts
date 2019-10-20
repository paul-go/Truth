
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`background`** shorthand CSS property sets all background style properties at once, such as color, image, origin and size, or repeat method.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background
		 */
		background(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`background`** shorthand CSS property sets all background style properties at once, such as color, image, origin and size, or repeat method.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background
		 */
		background(values: CssValue[][]): Call;
	}
}
