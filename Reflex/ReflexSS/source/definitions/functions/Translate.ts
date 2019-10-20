
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		translate(value: CssValue, ...values: CssValue[]): Call;
		/** */
		translate(values: CssValue[][]): Call;
	}
}
