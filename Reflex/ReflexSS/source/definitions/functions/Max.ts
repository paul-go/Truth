
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		max(value: CssValue, ...values: CssValue[]): Command;
		/** */
		max(values: CssValue[][]): Command;
	}
}
