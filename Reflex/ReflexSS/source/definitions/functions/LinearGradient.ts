
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		linearGradient(value: CssValue, ...values: CssValue[]): Command;
		/** */
		linearGradient(values: CssValue[][]): Command;
	}
}
