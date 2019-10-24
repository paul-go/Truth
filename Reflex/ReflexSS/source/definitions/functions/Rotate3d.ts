
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		rotate3d(value: CssValue, ...values: CssValue[]): Command;
		/** */
		rotate3d(values: CssValue[][]): Command;
	}
}
