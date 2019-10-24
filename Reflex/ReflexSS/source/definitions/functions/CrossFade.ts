
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		crossFade(value: CssValue, ...values: CssValue[]): Command;
		/** */
		crossFade(values: CssValue[][]): Command;
		/** */
		"cross-fade"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"cross-fade"(values: CssValue[][]): Command;
	}
}
