
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
		 * 
		 * **Initial value**: `normal`
		 * 
		 * @deprecated
		 */
		boxDirection(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`box-direction`** CSS property specifies whether a box lays out its contents normally (from the top or left edge), or in reverse (from the bottom or right edge).
		 * 
		 * **Initial value**: `normal`
		 * 
		 * @deprecated
		 */
		boxDirection(values: CssValue[][]): Command;
	}
}
