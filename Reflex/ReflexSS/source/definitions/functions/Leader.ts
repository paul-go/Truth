
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		leader(value: CssValue, ...values: CssValue[]): Call;
		/** */
		leader(values: CssValue[][]): Call;
	}
}
