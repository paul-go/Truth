
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		hsl(value: CssValue, ...values: CssValue[]): Command;
		/** */
		hsl(values: CssValue[][]): Command;
	}
}
