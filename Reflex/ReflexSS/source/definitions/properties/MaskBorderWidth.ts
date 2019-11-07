
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask-border-width`** CSS property sets the width of an element's mask border.
		 * 
		 * **Initial value**: `auto`
		 */
		maskBorderWidth(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask-border-width`** CSS property sets the width of an element's mask border.
		 * 
		 * **Initial value**: `auto`
		 */
		maskBorderWidth(values: CssValue[][]): Command;
	}
}
