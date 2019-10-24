
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		var(value: CssValue, ...values: CssValue[]): Command;
		/** */
		var(values: CssValue[][]): Command;
	}
}
