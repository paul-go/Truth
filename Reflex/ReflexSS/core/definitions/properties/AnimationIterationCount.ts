
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`animation-iteration-count`** CSS property sets the number of times an animation cycle should be played before stopping.
		 * 
		 * **Initial value**: `1`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-iteration-count
		 */
		animationIterationCount(...values: CssValue[]): Command;
		/**
		 * The **`animation-iteration-count`** CSS property sets the number of times an animation cycle should be played before stopping.
		 * 
		 * **Initial value**: `1`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-iteration-count
		 */
		animationIterationCount(...values: CssValue[][]): Command;
	}
}
