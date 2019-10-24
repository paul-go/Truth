
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		leader(value: CssValue, ...values: CssValue[]): Command;
		/** */
		leader(values: CssValue[][]): Command;
	}
}
