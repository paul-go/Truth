
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`quotes`** CSS property sets how quotation marks appear.
		 * 
		 * **Initial value**: depends on user agent
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **11** | **1.5** | **9**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/quotes
		 */
		quotes(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`quotes`** CSS property sets how quotation marks appear.
		 * 
		 * **Initial value**: depends on user agent
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **11** | **1.5** | **9**  | **12** | **8** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/quotes
		 */
		quotes(values: CssValue[][]): Command;
	}
}
