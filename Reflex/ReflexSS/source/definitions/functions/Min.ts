
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		min(value: CssValue, ...values: CssValue[]): Command;
		/** */
		min(values: CssValue[][]): Command;
	}
}
