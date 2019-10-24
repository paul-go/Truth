
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`animation`** shorthand CSS property sets an animated transition between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation
		 */
		animation(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`animation`** shorthand CSS property sets an animated transition between styles. It is a shorthand for `animation-name`, `animation-duration`, `animation-timing-function`, `animation-delay`, `animation-iteration-count`, `animation-direction`, `animation-fill-mode`, and `animation-play-state`.
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation
		 */
		animation(values: CssValue[][]): Command;
	}
}
