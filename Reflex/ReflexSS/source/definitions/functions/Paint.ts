
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		paint(value: CssValue, ...values: CssValue[]): Command;
		/** */
		paint(values: CssValue[][]): Command;
	}
}
