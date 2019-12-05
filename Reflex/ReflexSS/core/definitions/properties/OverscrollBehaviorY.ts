
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`overscroll-behavior-y`** CSS property sets the browser's behavior when the vertical boundary of a scrolling area is reached.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **63** | **59**  |   No   | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-y
		 */
		overscrollBehaviorY(...values: CssValue[]): Command;
		/**
		 * The **`overscroll-behavior-y`** CSS property sets the browser's behavior when the vertical boundary of a scrolling area is reached.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **63** | **59**  |   No   | **18** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overscroll-behavior-y
		 */
		overscrollBehaviorY(...values: CssValue[][]): Command;
	}
}
