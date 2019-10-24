
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		matrix(value: CssValue, ...values: CssValue[]): Command;
		/** */
		matrix(values: CssValue[][]): Command;
	}
}
