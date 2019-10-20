
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		counter(value: CssValue, ...values: CssValue[]): Call;
		/** */
		counter(values: CssValue[][]): Call;
	}
}
