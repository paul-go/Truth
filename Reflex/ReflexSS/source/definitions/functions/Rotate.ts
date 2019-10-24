
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		rotate(value: CssValue, ...values: CssValue[]): Command;
		/** */
		rotate(values: CssValue[][]): Command;
	}
}
