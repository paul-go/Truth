
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-image-outset`** CSS property sets the distance by which an element's border image is set out from its border box.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **15** | **15**  | **6**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-image-outset
		 */
		borderImageOutset(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`border-image-outset`** CSS property sets the distance by which an element's border image is set out from its border box.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **15** | **15**  | **6**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-image-outset
		 */
		borderImageOutset(values: CssValue[][]): Command;
	}
}
