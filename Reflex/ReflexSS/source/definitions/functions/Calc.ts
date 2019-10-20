
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		calc(value: CssValue, ...values: CssValue[]): Call;
		/** */
		calc(values: CssValue[][]): Call;
	}
}
