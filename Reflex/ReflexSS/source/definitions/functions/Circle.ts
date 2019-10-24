
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		circle(value: CssValue, ...values: CssValue[]): Command;
		/** */
		circle(values: CssValue[][]): Command;
	}
}
