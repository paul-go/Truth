
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-border-slice`** CSS property divides the image set by `mask-border-source` into regions. These regions are used to form the components of an element's mask border.
		 * 
		 * **Initial value**: `0`
		 */
		maskBorderSlice(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask-border-slice`** CSS property divides the image set by `mask-border-source` into regions. These regions are used to form the components of an element's mask border.
		 * 
		 * **Initial value**: `0`
		 */
		maskBorderSlice(values: CssValue[][]): Command;
	}
}
