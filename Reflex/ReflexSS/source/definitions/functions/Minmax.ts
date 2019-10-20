
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		minmax(value: CssValue, ...values: CssValue[]): Call;
		/** */
		minmax(values: CssValue[][]): Call;
	}
}
