
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		targetCounter(...values: CssValue[]): Command;
		/** */
		targetCounter(...values: CssValue[][]): Command;
	}
}
