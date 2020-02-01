
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		env(...values: CssValue[]): Command;
		/** */
		env(...values: CssValue[][]): Command;
	}
}
