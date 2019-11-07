
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  | Firefox |   Safari    |  Edge  |   IE    |
		 * | :-----: | :-----: | :---------: | :----: | :-----: |
		 * | **58**  | **69**  | **3** _-x-_ | **14** | **5.5** |
		 * | 1 _-x-_ |         |             |        |         |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/line-break
		 */
		lineBreak(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`line-break`** CSS property sets how to break lines of Chinese, Japanese, or Korean (CJK) text when working with punctuation and symbols.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  | Firefox |   Safari    |  Edge  |   IE    |
		 * | :-----: | :-----: | :---------: | :----: | :-----: |
		 * | **58**  | **69**  | **3** _-x-_ | **14** | **5.5** |
		 * | 1 _-x-_ |         |             |        |         |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/line-break
		 */
		lineBreak(values: CssValue[][]): Command;
	}
}
