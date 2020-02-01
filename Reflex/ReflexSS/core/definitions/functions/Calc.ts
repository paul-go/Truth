
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		calc(...values: CssValue[]): Command;
		/** */
		calc(...values: CssValue[][]): Command;
	}
}
