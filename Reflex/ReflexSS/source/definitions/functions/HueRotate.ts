
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		hueRotate(value: CssValue, ...values: CssValue[]): Command;
		/** */
		hueRotate(values: CssValue[][]): Command;
	}
}
