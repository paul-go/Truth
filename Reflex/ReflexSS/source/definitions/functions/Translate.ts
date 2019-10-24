
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		translate(value: CssValue, ...values: CssValue[]): Command;
		/** */
		translate(values: CssValue[][]): Command;
	}
}
