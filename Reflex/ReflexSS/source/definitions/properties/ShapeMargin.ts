
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`shape-margin`** CSS property sets a margin for a CSS shape created using `shape-outside`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox |     Safari     | Edge | IE  |
		 * | :----: | :-----: | :------------: | :--: | :-: |
		 * | **37** | **62**  | **10.1** _-x-_ |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/shape-margin
		 */
		shapeMargin(...values: CssValue[]): Command;
		/**
		 * The **`shape-margin`** CSS property sets a margin for a CSS shape created using `shape-outside`.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox |     Safari     | Edge | IE  |
		 * | :----: | :-----: | :------------: | :--: | :-: |
		 * | **37** | **62**  | **10.1** _-x-_ |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/shape-margin
		 */
		shapeMargin(...values: CssValue[][]): Command;
	}
}
