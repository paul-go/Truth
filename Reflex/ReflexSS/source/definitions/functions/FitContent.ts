
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		fitContent(value: CssValue, ...values: CssValue[]): Command;
		/** */
		fitContent(values: CssValue[][]): Command;
		/** */
		"fit-content"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"fit-content"(values: CssValue[][]): Command;
	}
}
