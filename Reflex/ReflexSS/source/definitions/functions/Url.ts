
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		url(value: CssValue, ...values: CssValue[]): Call;
		/** */
		url(values: CssValue[][]): Call;
	}
}
