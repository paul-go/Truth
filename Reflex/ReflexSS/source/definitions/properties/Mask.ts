
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`mask`** CSS property hides an element (partially or fully) by masking or clipping the image at specific points.
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :-----: | :----: | :-: |
		 * | **1**  |  **2**  | **3.2** | **12** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask
		 */
		mask(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`mask`** CSS property hides an element (partially or fully) by masking or clipping the image at specific points.
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :-----: | :----: | :-: |
		 * | **1**  |  **2**  | **3.2** | **12** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/mask
		 */
		mask(values: CssValue[][]): Command;
	}
}
