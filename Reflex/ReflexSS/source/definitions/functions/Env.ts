
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		env(value: CssValue, ...values: CssValue[]): Command;
		/** */
		env(values: CssValue[][]): Command;
	}
}
