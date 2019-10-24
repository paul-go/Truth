
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		element(value: CssValue, ...values: CssValue[]): Command;
		/** */
		element(values: CssValue[][]): Command;
	}
}
