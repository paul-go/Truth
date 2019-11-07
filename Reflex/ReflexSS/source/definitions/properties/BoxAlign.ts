
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
		 * 
		 * **Initial value**: `stretch`
		 * 
		 * @deprecated
		 */
		boxAlign(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`box-align`** CSS property specifies how an element aligns its contents across its layout in a perpendicular direction. The effect of the property is only visible if there is extra space in the box.
		 * 
		 * **Initial value**: `stretch`
		 * 
		 * @deprecated
		 */
		boxAlign(values: CssValue[][]): Command;
	}
}
