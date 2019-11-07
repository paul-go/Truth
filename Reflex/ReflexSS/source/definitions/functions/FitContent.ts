
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		fitContent(value: CssValue, ...values: CssValue[]): Command;
		/** */
		fitContent(values: CssValue[][]): Command;
	}
}
