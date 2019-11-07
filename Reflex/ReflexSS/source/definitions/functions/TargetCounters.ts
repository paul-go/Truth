
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		targetCounters(value: CssValue, ...values: CssValue[]): Command;
		/** */
		targetCounters(values: CssValue[][]): Command;
	}
}
