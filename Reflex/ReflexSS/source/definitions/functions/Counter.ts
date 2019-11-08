
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		counter(...values: CssValue[]): Command;
		/** */
		counter(...values: CssValue[][]): Command;
	}
}
