
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`box-orient`** CSS property specifies whether an element lays out its contents horizontally or vertically.
		 * 
		 * **Initial value**: `inline-axis` (`horizontal` in XUL)
		 * 
		 * @deprecated
		 */
		boxOrient(...values: CssValue[]): Command;
		/**
		 * The **`box-orient`** CSS property specifies whether an element lays out its contents horizontally or vertically.
		 * 
		 * **Initial value**: `inline-axis` (`horizontal` in XUL)
		 * 
		 * @deprecated
		 */
		boxOrient(...values: CssValue[][]): Command;
	}
}
