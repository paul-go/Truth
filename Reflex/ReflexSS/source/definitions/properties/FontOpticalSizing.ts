
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-optical-sizing`** CSS property sets whether text rendering is optimized for viewing at different sizes. This only works for fonts that have an optical size variation axis.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * |   No   | **62**  | **11** | **17** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-optical-sizing
		 */
		fontOpticalSizing(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`font-optical-sizing`** CSS property sets whether text rendering is optimized for viewing at different sizes. This only works for fonts that have an optical size variation axis.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * |   No   | **62**  | **11** | **17** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-optical-sizing
		 */
		fontOpticalSizing(values: CssValue[][]): Command;
	}
}
