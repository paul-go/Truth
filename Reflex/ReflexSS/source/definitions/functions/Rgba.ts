
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		rgba(value: CssValue, ...values: CssValue[]): Command;
		/** */
		rgba(values: CssValue[][]): Command;
	}
}
