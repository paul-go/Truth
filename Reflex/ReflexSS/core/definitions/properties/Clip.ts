
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`clip`** CSS property defines what portion of an element is visible. The `clip` property applies only to absolutely positioned elements, that is elements with `position:absolute` or `position:fixed`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * @deprecated
		 */
		clip(...values: CssValue[]): Command;
		/**
		 * The **`clip`** CSS property defines what portion of an element is visible. The `clip` property applies only to absolutely positioned elements, that is elements with `position:absolute` or `position:fixed`.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * @deprecated
		 */
		clip(...values: CssValue[][]): Command;
	}
}
