
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		invert(...values: CssValue[]): Command;
		/** */
		invert(...values: CssValue[][]): Command;
	}
}
