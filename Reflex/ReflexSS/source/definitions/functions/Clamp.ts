
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		clamp(value: CssValue, ...values: CssValue[]): Call;
		/** */
		clamp(values: CssValue[][]): Call;
	}
}
