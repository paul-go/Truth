
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`column-rule-color`** CSS property sets the color of the rule (line) drawn between columns in a multi-column layout.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-color
		 */
		columnRuleColor(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-rule-color`** CSS property sets the color of the rule (line) drawn between columns in a multi-column layout.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-rule-color
		 */
		columnRuleColor(values: CssValue[][]): Command;
	}
}
