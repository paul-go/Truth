
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		saturate(value: CssValue, ...values: CssValue[]): Call;
		/** */
		saturate(values: CssValue[][]): Call;
	}
}
