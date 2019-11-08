
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`image-rendering`** CSS property sets an image scaling algorithm. The property applies to an element itself, to any images set in its other properties, and to its descendants.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **13** | **3.6** | **6**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/image-rendering
		 */
		imageRendering(...values: CssValue[]): Command;
		/**
		 * The **`image-rendering`** CSS property sets an image scaling algorithm. The property applies to an element itself, to any images set in its other properties, and to its descendants.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * | **13** | **3.6** | **6**  |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/image-rendering
		 */
		imageRendering(...values: CssValue[][]): Command;
	}
}
