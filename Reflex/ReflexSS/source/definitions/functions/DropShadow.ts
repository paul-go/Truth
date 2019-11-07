
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		dropShadow(value: CssValue, ...values: CssValue[]): Command;
		/** */
		dropShadow(values: CssValue[][]): Command;
	}
}
