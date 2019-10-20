
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		targetCounter(value: CssValue, ...values: CssValue[]): Call;
		/** */
		targetCounter(values: CssValue[][]): Call;
		/** */
		"target-counter"(value: CssValue, ...values: CssValue[]): Call;
		/** */
		"target-counter"(values: CssValue[][]): Call;
	}
}
