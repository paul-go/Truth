
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`overscroll-behavior`** CSS property sets what a browser does when reaching the boundary of a scrolling area. It's a shorthand for `overscroll-behavior-x` and `overscroll-behavior-y`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **63** | **59**  |   No   | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior
		 */
		overscrollBehavior(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`overscroll-behavior`** CSS property sets what a browser does when reaching the boundary of a scrolling area. It's a shorthand for `overscroll-behavior-x` and `overscroll-behavior-y`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **63** | **59**  |   No   | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior
		 */
		overscrollBehavior(values: CssValue[][]): Command;
	}
}
