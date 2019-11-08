
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		perspective(...values: CssValue[]): Command;
		/** */
		perspective(...values: CssValue[][]): Command;
	}
}
