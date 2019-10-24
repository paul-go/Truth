
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		translateY(value: CssValue, ...values: CssValue[]): Command;
		/** */
		translateY(values: CssValue[][]): Command;
	}
}
