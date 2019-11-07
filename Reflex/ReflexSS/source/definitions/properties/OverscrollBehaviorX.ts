
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`overscroll-behavior-x`** CSS property sets the browser's behavior when the horizontal boundary of a scrolling area is reached.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **63** | **59**  |   No   | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-x
		 */
		overscrollBehaviorX(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`overscroll-behavior-x`** CSS property sets the browser's behavior when the horizontal boundary of a scrolling area is reached.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **63** | **59**  |   No   | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-x
		 */
		overscrollBehaviorX(values: CssValue[][]): Command;
	}
}
