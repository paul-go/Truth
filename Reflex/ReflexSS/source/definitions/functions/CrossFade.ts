
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		crossFade(value: CssValue, ...values: CssValue[]): Command;
		/** */
		crossFade(values: CssValue[][]): Command;
	}
}
