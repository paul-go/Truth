
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		var(value: CssValue, ...values: CssValue[]): Call;
		/** */
		var(values: CssValue[][]): Call;
	}
}
