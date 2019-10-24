
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		repeatingRadialGradient(value: CssValue, ...values: CssValue[]): Command;
		/** */
		repeatingRadialGradient(values: CssValue[][]): Command;
		/** */
		"repeating-radial-gradient"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"repeating-radial-gradient"(values: CssValue[][]): Command;
	}
}
