
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`border-radius`** CSS property rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * |  **4**  |  **4**  |  **5**  | **12** | **9** |
		 * | 1 _-x-_ |         | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-radius
		 */
		borderRadius(...values: CssValue[]): Command;
		/**
		 * The **`border-radius`** CSS property rounds the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners.
		 * 
		 * | Chrome  | Firefox | Safari  |  Edge  |  IE   |
		 * | :-----: | :-----: | :-----: | :----: | :---: |
		 * |  **4**  |  **4**  |  **5**  | **12** | **9** |
		 * | 1 _-x-_ |         | 3 _-x-_ |        |       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/border-radius
		 */
		borderRadius(...values: CssValue[][]): Command;
	}
}
