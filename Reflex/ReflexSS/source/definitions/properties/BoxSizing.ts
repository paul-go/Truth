
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`box-sizing`** CSS property defines how the user agent should calculate the total width and height of an element.
		 * 
		 * **Initial value**: `content-box`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * | **10**  | **29**  | **5.1** | **12** | **8** |
		 * | 1 _-x-_ | 1 _-x-_ | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/box-sizing
		 */
		boxSizing(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`box-sizing`** CSS property defines how the user agent should calculate the total width and height of an element.
		 * 
		 * **Initial value**: `content-box`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * | **10**  | **29**  | **5.1** | **12** | **8** |
		 * | 1 _-x-_ | 1 _-x-_ | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/box-sizing
		 */
		boxSizing(values: CssValue[][]): Command;
		/**
		 * The **`box-sizing`** CSS property defines how the user agent should calculate the total width and height of an element.
		 * 
		 * **Initial value**: `content-box`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * | **10**  | **29**  | **5.1** | **12** | **8** |
		 * | 1 _-x-_ | 1 _-x-_ | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/box-sizing
		 */
		"box-sizing"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`box-sizing`** CSS property defines how the user agent should calculate the total width and height of an element.
		 * 
		 * **Initial value**: `content-box`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * | **10**  | **29**  | **5.1** | **12** | **8** |
		 * | 1 _-x-_ | 1 _-x-_ | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/box-sizing
		 */
		"box-sizing"(values: CssValue[][]): Command;
	}
}
