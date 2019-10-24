
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		skew(value: CssValue, ...values: CssValue[]): Command;
		/** */
		skew(values: CssValue[][]): Command;
	}
}
