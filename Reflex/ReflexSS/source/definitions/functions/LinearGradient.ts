
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		linearGradient(value: CssValue, ...values: CssValue[]): Call;
		/** */
		linearGradient(values: CssValue[][]): Call;
		/** */
		"linear-gradient"(value: CssValue, ...values: CssValue[]): Call;
		/** */
		"linear-gradient"(values: CssValue[][]): Call;
	}
}
