
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		scale3d(value: CssValue, ...values: CssValue[]): Command;
		/** */
		scale3d(values: CssValue[][]): Command;
	}
}
