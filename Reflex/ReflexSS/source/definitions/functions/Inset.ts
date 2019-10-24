
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		inset(value: CssValue, ...values: CssValue[]): Command;
		/** */
		inset(values: CssValue[][]): Command;
	}
}
