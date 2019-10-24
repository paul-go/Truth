
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		image(value: CssValue, ...values: CssValue[]): Command;
		/** */
		image(values: CssValue[][]): Command;
	}
}
