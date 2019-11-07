
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		conicGradient(value: CssValue, ...values: CssValue[]): Command;
		/** */
		conicGradient(values: CssValue[][]): Command;
	}
}
