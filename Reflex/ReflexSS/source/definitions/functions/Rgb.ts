
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		rgb(value: CssValue, ...values: CssValue[]): Command;
		/** */
		rgb(values: CssValue[][]): Command;
	}
}
