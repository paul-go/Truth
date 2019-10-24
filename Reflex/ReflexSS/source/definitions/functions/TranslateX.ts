
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		translateX(value: CssValue, ...values: CssValue[]): Command;
		/** */
		translateX(values: CssValue[][]): Command;
	}
}
