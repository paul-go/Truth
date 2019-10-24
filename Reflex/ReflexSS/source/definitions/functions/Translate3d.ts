
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		translate3d(value: CssValue, ...values: CssValue[]): Command;
		/** */
		translate3d(values: CssValue[][]): Command;
	}
}
