
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		radialGradient(value: CssValue, ...values: CssValue[]): Command;
		/** */
		radialGradient(values: CssValue[][]): Command;
		/** */
		"radial-gradient"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"radial-gradient"(values: CssValue[][]): Command;
	}
}
