
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		url(value: CssValue, ...values: CssValue[]): Command;
		/** */
		url(values: CssValue[][]): Command;
	}
}
