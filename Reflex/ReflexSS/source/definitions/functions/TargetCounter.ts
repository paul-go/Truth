
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		targetCounter(value: CssValue, ...values: CssValue[]): Command;
		/** */
		targetCounter(values: CssValue[][]): Command;
		/** */
		"target-counter"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"target-counter"(values: CssValue[][]): Command;
	}
}
