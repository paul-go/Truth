
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		contrast(value: CssValue, ...values: CssValue[]): Command;
		/** */
		contrast(values: CssValue[][]): Command;
	}
}
