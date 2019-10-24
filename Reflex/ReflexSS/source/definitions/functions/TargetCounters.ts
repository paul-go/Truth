
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		targetCounters(value: CssValue, ...values: CssValue[]): Command;
		/** */
		targetCounters(values: CssValue[][]): Command;
		/** */
		"target-counters"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"target-counters"(values: CssValue[][]): Command;
	}
}
