
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The `**animation-timing-function**` CSS property sets how an animation progresses through the duration of each cycle.
		 * 
		 * **Initial value**: `ease`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-timing-function
		 */
		animationTimingFunction(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The `**animation-timing-function**` CSS property sets how an animation progresses through the duration of each cycle.
		 * 
		 * **Initial value**: `ease`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-timing-function
		 */
		animationTimingFunction(values: CssValue[][]): Command;
	}
}
