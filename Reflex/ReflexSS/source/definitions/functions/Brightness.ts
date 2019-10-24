
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		brightness(value: CssValue, ...values: CssValue[]): Command;
		/** */
		brightness(values: CssValue[][]): Command;
	}
}
