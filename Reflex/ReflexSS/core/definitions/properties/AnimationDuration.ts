
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
		 * 
		 * **Initial value**: `0s`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-duration
		 */
		animationDuration(...values: CssValue[]): Command;
		/**
		 * The **`animation-duration`** CSS property sets the length of time that an animation takes to complete one cycle.
		 * 
		 * **Initial value**: `0s`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-duration
		 */
		animationDuration(...values: CssValue[][]): Command;
	}
}
