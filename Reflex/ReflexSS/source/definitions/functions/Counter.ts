
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		counter(value: CssValue, ...values: CssValue[]): Command;
		/** */
		counter(values: CssValue[][]): Command;
	}
}
