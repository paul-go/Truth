
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		minmax(value: CssValue, ...values: CssValue[]): Command;
		/** */
		minmax(values: CssValue[][]): Command;
	}
}
