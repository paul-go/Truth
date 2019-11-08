
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`background-position-x`** CSS property sets the initial horizontal position for each background image. The position is relative to the position layer set by `background-origin`.
		 * 
		 * **Initial value**: `left`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  | **49**  | **1**  | **12** | **6** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-position-x
		 */
		backgroundPositionX(...values: CssValue[]): Command;
		/**
		 * The **`background-position-x`** CSS property sets the initial horizontal position for each background image. The position is relative to the position layer set by `background-origin`.
		 * 
		 * **Initial value**: `left`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **1**  | **49**  | **1**  | **12** | **6** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/background-position-x
		 */
		backgroundPositionX(...values: CssValue[][]): Command;
	}
}
