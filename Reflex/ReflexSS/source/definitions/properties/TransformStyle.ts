
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`transform-style`** CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.
		 * 
		 * **Initial value**: `flat`
		 * 
		 * |  Chrome  | Firefox  | Safari  |  Edge  | IE  |
		 * | :------: | :------: | :-----: | :----: | :-: |
		 * |  **36**  |  **16**  |  **9**  | **12** | No  |
		 * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transform-style
		 */
		transformStyle(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`transform-style`** CSS property sets whether children of an element are positioned in the 3D space or are flattened in the plane of the element.
		 * 
		 * **Initial value**: `flat`
		 * 
		 * |  Chrome  | Firefox  | Safari  |  Edge  | IE  |
		 * | :------: | :------: | :-----: | :----: | :-: |
		 * |  **36**  |  **16**  |  **9**  | **12** | No  |
		 * | 12 _-x-_ | 10 _-x-_ | 4 _-x-_ |        |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/transform-style
		 */
		transformStyle(values: CssValue[][]): Command;
	}
}
