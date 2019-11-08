
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		crossFade(...values: CssValue[]): Command;
		/** */
		crossFade(...values: CssValue[][]): Command;
	}
}
