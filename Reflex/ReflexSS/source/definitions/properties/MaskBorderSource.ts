
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-border-source`** CSS property sets the source image used to create an element's mask border.
		 * 
		 * **Initial value**: `none`
		 */
		maskBorderSource(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask-border-source`** CSS property sets the source image used to create an element's mask border.
		 * 
		 * **Initial value**: `none`
		 */
		maskBorderSource(values: CssValue[][]): Command;
	}
}
