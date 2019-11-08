
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-clip`** CSS property determines the area, which is affected by a mask. The painted content of an element must be restricted to this area.
		 * 
		 * **Initial value**: `border-box`
		 * 
		 * |   Chrome    | Firefox |   Safari    | Edge | IE  |
		 * | :---------: | :-----: | :---------: | :--: | :-: |
		 * | **1** _-x-_ | **53**  | **4** _-x-_ |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-clip
		 */
		maskClip(...values: CssValue[]): Command;
		/**
		 * The **`mask-clip`** CSS property determines the area, which is affected by a mask. The painted content of an element must be restricted to this area.
		 * 
		 * **Initial value**: `border-box`
		 * 
		 * |   Chrome    | Firefox |   Safari    | Edge | IE  |
		 * | :---------: | :-----: | :---------: | :--: | :-: |
		 * | **1** _-x-_ | **53**  | **4** _-x-_ |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask-clip
		 */
		maskClip(...values: CssValue[][]): Command;
	}
}
