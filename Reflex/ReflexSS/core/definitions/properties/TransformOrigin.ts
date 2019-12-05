
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`transform-origin`** CSS property sets the origin for an element's transformations.
		 * 
		 * **Initial value**: `50% 50% 0`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE    |
		 * | :-----: | :-------: | :-----: | :----: | :-----: |
		 * | **36**  |  **16**   |  **9**  | **12** | **10**  |
		 * | 1 _-x-_ | 3.5 _-x-_ | 2 _-x-_ |        | 9 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transform-origin
		 */
		transformOrigin(...values: CssValue[]): Command;
		/**
		 * The **`transform-origin`** CSS property sets the origin for an element's transformations.
		 * 
		 * **Initial value**: `50% 50% 0`
		 * 
		 * | Chrome  |  Firefox  | Safari  |  Edge  |   IE    |
		 * | :-----: | :-------: | :-----: | :----: | :-----: |
		 * | **36**  |  **16**   |  **9**  | **12** | **10**  |
		 * | 1 _-x-_ | 3.5 _-x-_ | 2 _-x-_ |        | 9 _-x-_ |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transform-origin
		 */
		transformOrigin(...values: CssValue[][]): Command;
	}
}
