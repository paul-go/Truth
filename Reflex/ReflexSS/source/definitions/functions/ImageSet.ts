
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		imageSet(value: CssValue, ...values: CssValue[]): Command;
		/** */
		imageSet(values: CssValue[][]): Command;
	}
}
