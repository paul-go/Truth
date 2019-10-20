
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-family`** CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.
		 * 
		 * **Initial value**: depends on user agent
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-family
		 */
		fontFamily(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`font-family`** CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.
		 * 
		 * **Initial value**: depends on user agent
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-family
		 */
		fontFamily(values: CssValue[][]): Call;
		/**
		 * The **`font-family`** CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.
		 * 
		 * **Initial value**: depends on user agent
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-family
		 */
		"font-family"(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`font-family`** CSS property specifies a prioritized list of one or more font family names and/or generic family names for the selected element.
		 * 
		 * **Initial value**: depends on user agent
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **3** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-family
		 */
		"font-family"(values: CssValue[][]): Call;
	}
}
