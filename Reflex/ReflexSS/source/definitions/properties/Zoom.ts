
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The non-standard **`zoom`** CSS property can be used to control the magnification level of an element. `transform: scale()` should be used instead of this property, if possible. However, unlike CSS Transforms, `zoom` affects the layout size of the element.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE    |
		 * | :----: | :-----: | :-----: | :----: | :-----: |
		 * | **1**  |   No    | **3.1** | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/zoom
		 */
		zoom(...values: CssValue[]): Command;
		/**
		 * The non-standard **`zoom`** CSS property can be used to control the magnification level of an element. `transform: scale()` should be used instead of this property, if possible. However, unlike CSS Transforms, `zoom` affects the layout size of the element.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari  |  Edge  |   IE    |
		 * | :----: | :-----: | :-----: | :----: | :-----: |
		 * | **1**  |   No    | **3.1** | **12** | **5.5** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/zoom
		 */
		zoom(...values: CssValue[][]): Command;
	}
}
