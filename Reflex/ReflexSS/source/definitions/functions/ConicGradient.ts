
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		conicGradient(value: CssValue, ...values: CssValue[]): Command;
		/** */
		conicGradient(values: CssValue[][]): Command;
		/** */
		"conic-gradient"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"conic-gradient"(values: CssValue[][]): Command;
	}
}
