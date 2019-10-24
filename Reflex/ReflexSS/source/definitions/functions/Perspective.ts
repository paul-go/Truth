
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		perspective(value: CssValue, ...values: CssValue[]): Command;
		/** */
		perspective(values: CssValue[][]): Command;
	}
}
