
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`animation-direction`** CSS property sets whether an animation should play forwards, backwards, or alternating back and forth.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-direction
		 */
		animationDirection(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`animation-direction`** CSS property sets whether an animation should play forwards, backwards, or alternating back and forth.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-direction
		 */
		animationDirection(values: CssValue[][]): Command;
	}
}
