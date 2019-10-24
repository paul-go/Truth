
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/** */
		imageSet(value: CssValue, ...values: CssValue[]): Command;
		/** */
		imageSet(values: CssValue[][]): Command;
		/** */
		"image-set"(value: CssValue, ...values: CssValue[]): Command;
		/** */
		"image-set"(values: CssValue[][]): Command;
	}
}
