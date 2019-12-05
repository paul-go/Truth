
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		minmax(...values: CssValue[]): Command;
		/** */
		minmax(...values: CssValue[][]): Command;
	}
}
