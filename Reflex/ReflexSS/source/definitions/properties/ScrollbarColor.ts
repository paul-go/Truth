
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`scrollbar-color`** CSS property sets the color of the scrollbar track and thumb.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **64**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/scrollbar-color
		 */
		scrollbarColor(...values: CssValue[]): Command;
		/**
		 * The **`scrollbar-color`** CSS property sets the color of the scrollbar track and thumb.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **64**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/scrollbar-color
		 */
		scrollbarColor(...values: CssValue[][]): Command;
	}
}
