
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-image-source`** CSS property sets the source image used to create an element's border image.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **15** | **15**  | **6**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-image-source
		 */
		borderImageSource(...values: CssValue[]): Command;
		/**
		 * The **`border-image-source`** CSS property sets the source image used to create an element's border image.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * | **15** | **15**  | **6**  | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-image-source
		 */
		borderImageSource(...values: CssValue[][]): Command;
	}
}
