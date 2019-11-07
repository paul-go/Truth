
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 5 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-fill-mode
		 */
		animationFillMode(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`animation-fill-mode`** CSS property sets how a CSS animation applies styles to its target before and after its execution.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |   IE   |
		 * | :-----: | :-----: | :-----: | :----: | :----: |
		 * | **43**  | **16**  |  **9**  | **12** | **10** |
		 * | 3 _-x-_ | 5 _-x-_ | 5 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/animation-fill-mode
		 */
		animationFillMode(values: CssValue[][]): Command;
	}
}
