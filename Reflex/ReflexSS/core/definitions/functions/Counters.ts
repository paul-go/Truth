
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		counters(...values: CssValue[]): Command;
		/** */
		counters(...values: CssValue[][]): Command;
	}
}
