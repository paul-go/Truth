
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		leader(...values: CssValue[]): Command;
		/** */
		leader(...values: CssValue[][]): Command;
	}
}
