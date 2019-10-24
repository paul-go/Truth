
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		translateZ(value: CssValue, ...values: CssValue[]): Command;
		/** */
		translateZ(values: CssValue[][]): Command;
	}
}
