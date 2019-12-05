
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-image-repeat`** CSS property defines how the edge regions of a source image are adjusted to fit the dimensions of an element's border image.
		 * 
		 * **Initial value**: `stretch`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **15** | **15**  | **6**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-image-repeat
		 */
		borderImageRepeat(...values: CssValue[]): Command;
		/**
		 * The **`border-image-repeat`** CSS property defines how the edge regions of a source image are adjusted to fit the dimensions of an element's border image.
		 * 
		 * **Initial value**: `stretch`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **15** | **15**  | **6**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-image-repeat
		 */
		borderImageRepeat(...values: CssValue[][]): Command;
	}
}
