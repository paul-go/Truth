
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		polygon(value: CssValue, ...values: CssValue[]): Command;
		/** */
		polygon(values: CssValue[][]): Command;
	}
}
