
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		dropShadow(value: CssValue, ...values: CssValue[]): Command;
		/** */
		dropShadow(values: CssValue[][]): Command;
		/** */
		"drop-shadow"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"drop-shadow"(values: CssValue[][]): Command;
	}
}
