
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The `**clip-path**` CSS property creates a clipping region that sets what part of an element should be shown. Parts that are inside the region are shown, while those outside are hidden.
		 * 
		 * **Initial value**: `none`
		 * 
		 * |  Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :------: | :-----: | :-------: | :----: | :----: |
		 * |  **55**  | **3.5** |  **9.1**  | **12** | **10** |
		 * | 23 _-x-_ |         | 6.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/clip-path
		 */
		clipPath(...values: CssValue[]): Command;
		/**
		 * The `**clip-path**` CSS property creates a clipping region that sets what part of an element should be shown. Parts that are inside the region are shown, while those outside are hidden.
		 * 
		 * **Initial value**: `none`
		 * 
		 * |  Chrome  | Firefox |  Safari   |  Edge  |   IE   |
		 * | :------: | :-----: | :-------: | :----: | :----: |
		 * |  **55**  | **3.5** |  **9.1**  | **12** | **10** |
		 * | 23 _-x-_ |         | 6.1 _-x-_ |        |        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/clip-path
		 */
		clipPath(...values: CssValue[][]): Command;
	}
}
