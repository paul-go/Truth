
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		var(...values: CssValue[]): Command;
		/** */
		var(...values: CssValue[][]): Command;
	}
}
