
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`box-lines`** CSS property determines whether the box may have a single or multiple lines (rows for horizontally oriented boxes, columns for vertically oriented boxes).
		 * 
		 * **Initial value**: `single`
		 * 
		 * @deprecated
		 */
		boxLines(...values: CssValue[]): Command;
		/**
		 * The **`box-lines`** CSS property determines whether the box may have a single or multiple lines (rows for horizontally oriented boxes, columns for vertically oriented boxes).
		 * 
		 * **Initial value**: `single`
		 * 
		 * @deprecated
		 */
		boxLines(...values: CssValue[][]): Command;
	}
}
