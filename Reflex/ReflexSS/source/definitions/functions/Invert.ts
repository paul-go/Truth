
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		invert(value: CssValue, ...values: CssValue[]): Call;
		/** */
		invert(values: CssValue[][]): Call;
	}
}
