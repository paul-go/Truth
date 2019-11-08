
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		url(...values: CssValue[]): Command;
		/** */
		url(...values: CssValue[][]): Command;
	}
}
