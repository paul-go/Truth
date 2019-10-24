
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		saturate(value: CssValue, ...values: CssValue[]): Command;
		/** */
		saturate(values: CssValue[][]): Command;
	}
}
