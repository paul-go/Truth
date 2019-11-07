
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`overflow-clip-box`** CSS property specifies relative to which box the clipping happens when there is an overflow. It is short hand for the `overflow-clip-box-inline` and `overflow-clip-box-block` properties.
		 * 
		 * **Initial value**: `padding-box`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **29**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Mozilla/CSS/overflow-clip-box
		 */
		overflowClipBox(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`overflow-clip-box`** CSS property specifies relative to which box the clipping happens when there is an overflow. It is short hand for the `overflow-clip-box-inline` and `overflow-clip-box-block` properties.
		 * 
		 * **Initial value**: `padding-box`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **29**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Mozilla/CSS/overflow-clip-box
		 */
		overflowClipBox(values: CssValue[][]): Command;
	}
}
