
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`animation-name`** CSS property sets one or more animations to apply to an element. Each name is an `@keyframes` at-rule that sets the property values for the animation sequence.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-name
		 */
		animationName(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`animation-name`** CSS property sets one or more animations to apply to an element. Each name is an `@keyframes` at-rule that sets the property values for the animation sequence.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 4 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-name
		 */
		animationName(values: CssValue[][]): Command;
	}
}
