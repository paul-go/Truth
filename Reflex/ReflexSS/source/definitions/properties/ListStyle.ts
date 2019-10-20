
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`list-style`** CSS property is a shorthand to set list style properties `list-style-type`, `list-style-image`, and `list-style-position`.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style
		 */
		listStyle(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`list-style`** CSS property is a shorthand to set list style properties `list-style-type`, `list-style-image`, and `list-style-position`.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style
		 */
		listStyle(values: CssValue[][]): Call;
		/**
		 * The **`list-style`** CSS property is a shorthand to set list style properties `list-style-type`, `list-style-image`, and `list-style-position`.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style
		 */
		"list-style"(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`list-style`** CSS property is a shorthand to set list style properties `list-style-type`, `list-style-image`, and `list-style-position`.
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/list-style
		 */
		"list-style"(values: CssValue[][]): Call;
	}
}
