
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`scroll-snap-points-x`** CSS property defines the horizontal positioning of snap points within the content of the scroll container they are applied to.
		 * 
		 * **Initial value**: `none`
		 * 
		 * @deprecated
		 */
		scrollSnapPointsX(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`scroll-snap-points-x`** CSS property defines the horizontal positioning of snap points within the content of the scroll container they are applied to.
		 * 
		 * **Initial value**: `none`
		 * 
		 * @deprecated
		 */
		scrollSnapPointsX(values: CssValue[][]): Command;
	}
}
