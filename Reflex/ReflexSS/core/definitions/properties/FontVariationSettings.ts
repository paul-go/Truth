
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-variation-settings`** CSS property provides low-level control over variable font characteristics, by specifying the four letter axis names of the characteristics you want to vary, along with their values.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **62** | **62**  | **11** | **17** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-variation-settings
		 */
		fontVariationSettings(...values: CssValue[]): Command;
		/**
		 * The **`font-variation-settings`** CSS property provides low-level control over variable font characteristics, by specifying the four letter axis names of the characteristics you want to vary, along with their values.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * | **62** | **62**  | **11** | **17** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-variation-settings
		 */
		fontVariationSettings(...values: CssValue[][]): Command;
	}
}
