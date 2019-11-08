
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-mode`** CSS property sets whether the mask reference defined by `mask-image` is treated as a luminance or alpha mask.
		 * 
		 * **Initial value**: `match-source`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **53**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-mode
		 */
		maskMode(...values: CssValue[]): Command;
		/**
		 * The **`mask-mode`** CSS property sets whether the mask reference defined by `mask-image` is treated as a luminance or alpha mask.
		 * 
		 * **Initial value**: `match-source`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **53**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-mode
		 */
		maskMode(...values: CssValue[][]): Command;
	}
}
