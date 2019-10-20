
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		element(value: CssValue, ...values: CssValue[]): Call;
		/** */
		element(values: CssValue[][]): Call;
	}
}
