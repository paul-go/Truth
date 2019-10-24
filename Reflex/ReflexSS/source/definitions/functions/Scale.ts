
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		scale(value: CssValue, ...values: CssValue[]): Command;
		/** */
		scale(values: CssValue[][]): Command;
	}
}
