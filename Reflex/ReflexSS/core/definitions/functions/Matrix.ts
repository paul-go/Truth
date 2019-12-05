
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		matrix(...values: CssValue[]): Command;
		/** */
		matrix(...values: CssValue[][]): Command;
	}
}
