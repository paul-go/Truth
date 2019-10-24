
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		opacity(value: CssValue, ...values: CssValue[]): Command;
		/** */
		opacity(values: CssValue[][]): Command;
	}
}
