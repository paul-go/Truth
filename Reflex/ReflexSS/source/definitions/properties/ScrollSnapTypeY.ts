
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`scroll-snap-type-y`** CSS property defines how strictly snap points are enforced on the vertical axis of the scroll container in case there is one.
		 * 
		 * **Initial value**: `none`
		 * 
		 * @deprecated
		 */
		scrollSnapTypeY(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`scroll-snap-type-y`** CSS property defines how strictly snap points are enforced on the vertical axis of the scroll container in case there is one.
		 * 
		 * **Initial value**: `none`
		 * 
		 * @deprecated
		 */
		scrollSnapTypeY(values: CssValue[][]): Command;
	}
}
