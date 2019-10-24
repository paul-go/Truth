
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		counters(value: CssValue, ...values: CssValue[]): Command;
		/** */
		counters(values: CssValue[][]): Command;
	}
}
