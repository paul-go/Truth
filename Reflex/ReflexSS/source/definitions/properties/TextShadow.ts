
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-shadow`** CSS property adds shadows to text. It accepts a comma-separated list of shadows to be applied to the text and any of its `decorations`. Each shadow is described by some combination of X and Y offsets from the element, blur radius, and color.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE   |
		 * | :----: | :-----: | :-----: | :----: | :----: |
		 * | **2**  | **3.5** | **1.1** | **12** | **10** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-shadow
		 */
		textShadow(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-shadow`** CSS property adds shadows to text. It accepts a comma-separated list of shadows to be applied to the text and any of its `decorations`. Each shadow is described by some combination of X and Y offsets from the element, blur radius, and color.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE   |
		 * | :----: | :-----: | :-----: | :----: | :----: |
		 * | **2**  | **3.5** | **1.1** | **12** | **10** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-shadow
		 */
		textShadow(values: CssValue[][]): Command;
	}
}
