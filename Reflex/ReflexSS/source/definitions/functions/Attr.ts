
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		attr(value: CssValue, ...values: CssValue[]): Call;
		/** */
		attr(values: CssValue[][]): Call;
	}
}
