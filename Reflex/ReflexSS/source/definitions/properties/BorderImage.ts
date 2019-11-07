
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-image`** CSS property draws an image in place of an element's `border-style`.
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **16**  |  **15**   |  **6**  | **12** | **11** |
		 * | 7 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-image
		 */
		borderImage(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-image`** CSS property draws an image in place of an element's `border-style`.
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE   |
		 * | :-----: | :-------: | :-----: | :----: | :----: |
		 * | **16**  |  **15**   |  **6**  | **12** | **11** |
		 * | 7 _-x-_ | 3.5 _-x-_ | 3 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-image
		 */
		borderImage(values: CssValue[][]): Command;
	}
}
