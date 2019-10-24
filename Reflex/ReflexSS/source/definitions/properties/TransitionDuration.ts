
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
		 * 
		 * **Initial value**: `0s`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-duration
		 */
		transitionDuration(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
		 * 
		 * **Initial value**: `0s`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-duration
		 */
		transitionDuration(values: CssValue[][]): Command;
		/**
		 * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
		 * 
		 * **Initial value**: `0s`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-duration
		 */
		"transition-duration"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`transition-duration`** CSS property sets the length of time a transition animation should take to complete. By default, the value is `0s`, meaning that no animation will occur.
		 * 
		 * **Initial value**: `0s`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-duration
		 */
		"transition-duration"(values: CssValue[][]): Command;
	}
}
