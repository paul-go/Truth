
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`user-modify`** property has no effect in Firefox. It was originally planned to determine whether or not the content of an element can be edited by a user.
		 * 
		 * **Initial value**: `read-only`
		 */
		userModify(...values: CssValue[]): Command;
		/**
		 * The **`user-modify`** property has no effect in Firefox. It was originally planned to determine whether or not the content of an element can be edited by a user.
		 * 
		 * **Initial value**: `read-only`
		 */
		userModify(...values: CssValue[][]): Command;
	}
}
