
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		matrix3d(value: CssValue, ...values: CssValue[]): Command;
		/** */
		matrix3d(values: CssValue[][]): Command;
	}
}
