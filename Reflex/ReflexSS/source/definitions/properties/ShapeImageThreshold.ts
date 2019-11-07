
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`shape-image-threshold`** CSS property sets the alpha channel threshold used to extract the shape using an image as the value for `shape-outside`.
		 * 
		 * **Initial value**: `0.0`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **37** | **62**  | **10.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/shape-image-threshold
		 */
		shapeImageThreshold(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`shape-image-threshold`** CSS property sets the alpha channel threshold used to extract the shape using an image as the value for `shape-outside`.
		 * 
		 * **Initial value**: `0.0`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **37** | **62**  | **10.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/shape-image-threshold
		 */
		shapeImageThreshold(values: CssValue[][]): Command;
	}
}
