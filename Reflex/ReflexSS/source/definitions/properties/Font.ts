
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font`** CSS property is a shorthand for `font-style`, `font-variant`, `font-weight`, `font-size`, `line-height`, and `font-family`. Alternatively, it sets an element's font to a system font.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font
		 */
		font(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`font`** CSS property is a shorthand for `font-style`, `font-variant`, `font-weight`, `font-size`, `line-height`, and `font-family`. Alternatively, it sets an element's font to a system font.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font
		 */
		font(values: CssValue[][]): Call;
	}
}
