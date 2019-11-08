
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		clamp(...values: CssValue[]): Command;
		/** */
		clamp(...values: CssValue[][]): Command;
	}
}
