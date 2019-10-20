
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		env(value: CssValue, ...values: CssValue[]): Call;
		/** */
		env(values: CssValue[][]): Call;
	}
}
