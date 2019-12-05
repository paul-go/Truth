
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		translate(...values: CssValue[]): Command;
		/** */
		translate(...values: CssValue[][]): Command;
	}
}
