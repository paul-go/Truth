
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-border-mode`** CSS property specifies the blending mode used in a mask border.
		 * 
		 * **Initial value**: `alpha`
		 */
		maskBorderMode(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask-border-mode`** CSS property specifies the blending mode used in a mask border.
		 * 
		 * **Initial value**: `alpha`
		 */
		maskBorderMode(values: CssValue[][]): Command;
	}
}
