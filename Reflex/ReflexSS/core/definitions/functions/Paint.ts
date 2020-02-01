
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		paint(...values: CssValue[]): Command;
		/** */
		paint(...values: CssValue[][]): Command;
	}
}
