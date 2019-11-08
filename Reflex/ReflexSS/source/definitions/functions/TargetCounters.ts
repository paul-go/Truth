
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		targetCounters(...values: CssValue[]): Command;
		/** */
		targetCounters(...values: CssValue[][]): Command;
	}
}
