
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		crossFade(value: CssValue, ...values: CssValue[]): Call;
		/** */
		crossFade(values: CssValue[][]): Call;
		/** */
		"cross-fade"(value: CssValue, ...values: CssValue[]): Call;
		/** */
		"cross-fade"(values: CssValue[][]): Call;
	}
}
