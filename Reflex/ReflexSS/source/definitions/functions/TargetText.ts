
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		targetText(value: CssValue, ...values: CssValue[]): Command;
		/** */
		targetText(values: CssValue[][]): Command;
		/** */
		"target-text"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"target-text"(values: CssValue[][]): Command;
	}
}
