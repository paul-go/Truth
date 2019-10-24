
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		calc(value: CssValue, ...values: CssValue[]): Command;
		/** */
		calc(values: CssValue[][]): Command;
	}
}
