
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		rgb(...values: CssValue[]): Command;
		/** */
		rgb(...values: CssValue[][]): Command;
	}
}
