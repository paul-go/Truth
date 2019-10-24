
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
		 * 
		 * **Initial value**: all
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-property
		 */
		transitionProperty(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
		 * 
		 * **Initial value**: all
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-property
		 */
		transitionProperty(values: CssValue[][]): Command;
		/**
		 * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
		 * 
		 * **Initial value**: all
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-property
		 */
		"transition-property"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`transition-property`** CSS property sets the CSS properties to which a transition effect should be applied.
		 * 
		 * **Initial value**: all
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-property
		 */
		"transition-property"(values: CssValue[][]): Command;
	}
}
