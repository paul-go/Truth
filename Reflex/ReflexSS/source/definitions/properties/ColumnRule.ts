
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`column-rule`** CSS property sets the width, style, and color of the rule (line) drawn between columns in a multi-column layout.
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-rule
		 */
		columnRule(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`column-rule`** CSS property sets the width, style, and color of the rule (line) drawn between columns in a multi-column layout.
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **50**  |  **52**   |  **9**  | **12** | **10** |
		 * | 1 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/column-rule
		 */
		columnRule(values: CssValue[][]): Command;
	}
}
