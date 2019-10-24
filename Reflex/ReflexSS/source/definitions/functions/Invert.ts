
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		invert(value: CssValue, ...values: CssValue[]): Command;
		/** */
		invert(values: CssValue[][]): Command;
	}
}
