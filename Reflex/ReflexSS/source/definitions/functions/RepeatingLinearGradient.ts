
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		repeatingLinearGradient(value: CssValue, ...values: CssValue[]): Command;
		/** */
		repeatingLinearGradient(values: CssValue[][]): Command;
		/** */
		"repeating-linear-gradient"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"repeating-linear-gradient"(values: CssValue[][]): Command;
	}
}
