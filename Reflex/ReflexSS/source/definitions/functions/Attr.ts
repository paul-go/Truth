
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		attr(value: CssValue, ...values: CssValue[]): Command;
		/** */
		attr(values: CssValue[][]): Command;
	}
}
