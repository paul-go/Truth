
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`background-color`** CSS property sets the background color of an element.
		 * 
		 * **Initial value**: `transparent`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-color
		 */
		backgroundColor(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`background-color`** CSS property sets the background color of an element.
		 * 
		 * **Initial value**: `transparent`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-color
		 */
		backgroundColor(values: CssValue[][]): Command;
		/**
		 * The **`background-color`** CSS property sets the background color of an element.
		 * 
		 * **Initial value**: `transparent`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-color
		 */
		"background-color"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`background-color`** CSS property sets the background color of an element.
		 * 
		 * **Initial value**: `transparent`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-color
		 */
		"background-color"(values: CssValue[][]): Command;
	}
}
