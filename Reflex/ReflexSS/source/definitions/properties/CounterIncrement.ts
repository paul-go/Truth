
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`counter-increment`** CSS property increases or decreases the value of a CSS counter by a given value.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **2**  |  **1**  | **3**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-increment
		 */
		counterIncrement(...values: CssValue[]): Command;
		/**
		 * The **`counter-increment`** CSS property increases or decreases the value of a CSS counter by a given value.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **2**  |  **1**  | **3**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-increment
		 */
		counterIncrement(...values: CssValue[][]): Command;
	}
}
