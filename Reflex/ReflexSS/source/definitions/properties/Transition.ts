
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition
		 */
		transition(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`transition`** CSS property is a shorthand property for `transition-property`, `transition-duration`, `transition-timing-function`, and `transition-delay`.
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition
		 */
		transition(values: CssValue[][]): Command;
	}
}
