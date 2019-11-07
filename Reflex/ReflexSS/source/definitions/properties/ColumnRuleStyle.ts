
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`column-rule-style`** CSS property sets the style of the line drawn between columns in a multi-column layout.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-style
		 */
		columnRuleStyle(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-rule-style`** CSS property sets the style of the line drawn between columns in a multi-column layout.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-style
		 */
		columnRuleStyle(values: CssValue[][]): Command;
	}
}
