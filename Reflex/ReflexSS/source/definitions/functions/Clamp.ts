
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		clamp(value: CssValue, ...values: CssValue[]): Command;
		/** */
		clamp(values: CssValue[][]): Command;
	}
}
