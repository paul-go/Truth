
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`padding-top`** padding area on the top of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-top
		 */
		paddingTop(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`padding-top`** padding area on the top of an element.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  |  **1**  | **1**  | **12** | **4** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/padding-top
		 */
		paddingTop(values: CssValue[][]): Command;
	}
}
