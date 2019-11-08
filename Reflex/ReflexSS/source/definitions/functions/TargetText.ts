
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		targetText(...values: CssValue[]): Command;
		/** */
		targetText(...values: CssValue[][]): Command;
	}
}
