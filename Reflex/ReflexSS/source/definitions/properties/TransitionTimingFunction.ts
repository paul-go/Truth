
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
		 * 
		 * **Initial value**: `ease`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-timing-function
		 */
		transitionTimingFunction(...values: CssValue[]): Command;
		/**
		 * The **`transition-timing-function`** CSS property sets how intermediate values are calculated for CSS properties being affected by a transition effect.
		 * 
		 * **Initial value**: `ease`
		 * 
		 * | Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :-----: | :-----: | :-------: | :----: | :----: |
		 * | **26**  | **16**  |   **9**   | **12** | **10** |
		 * | 1 _-x-_ | 4 _-x-_ | 3.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transition-timing-function
		 */
		transitionTimingFunction(...values: CssValue[][]): Command;
	}
}
