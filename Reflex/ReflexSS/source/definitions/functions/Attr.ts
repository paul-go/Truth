
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		attr(...values: CssValue[]): Command;
		/** */
		attr(...values: CssValue[][]): Command;
	}
}
