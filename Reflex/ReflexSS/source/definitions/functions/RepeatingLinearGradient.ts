
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		repeatingLinearGradient(value: CssValue, ...values: CssValue[]): Command;
		/** */
		repeatingLinearGradient(values: CssValue[][]): Command;
	}
}
