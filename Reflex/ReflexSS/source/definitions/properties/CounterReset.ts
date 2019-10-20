
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`counter-reset`** CSS property resets a CSS counter to a given value.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **2**  |  **1**  | **3**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-reset
		 */
		counterReset(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`counter-reset`** CSS property resets a CSS counter to a given value.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **2**  |  **1**  | **3**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-reset
		 */
		counterReset(values: CssValue[][]): Call;
		/**
		 * The **`counter-reset`** CSS property resets a CSS counter to a given value.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **2**  |  **1**  | **3**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-reset
		 */
		"counter-reset"(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`counter-reset`** CSS property resets a CSS counter to a given value.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **2**  |  **1**  | **3**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-reset
		 */
		"counter-reset"(values: CssValue[][]): Call;
	}
}
