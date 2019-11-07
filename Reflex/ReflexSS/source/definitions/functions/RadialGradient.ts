
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		radialGradient(value: CssValue, ...values: CssValue[]): Command;
		/** */
		radialGradient(values: CssValue[][]): Command;
	}
}
