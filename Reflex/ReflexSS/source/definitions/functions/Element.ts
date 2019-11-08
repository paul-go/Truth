
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		element(...values: CssValue[]): Command;
		/** */
		element(...values: CssValue[][]): Command;
	}
}
