
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`grid-column`** CSS property is a shorthand property for `grid-column-start` and `grid-column-end` specifying a grid item's size and location within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-column
		 */
		gridColumn(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-column`** CSS property is a shorthand property for `grid-column-start` and `grid-column-end` specifying a grid item's size and location within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-column
		 */
		gridColumn(values: CssValue[][]): Command;
		/**
		 * The **`grid-column`** CSS property is a shorthand property for `grid-column-start` and `grid-column-end` specifying a grid item's size and location within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-column
		 */
		"grid-column"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-column`** CSS property is a shorthand property for `grid-column-start` and `grid-column-end` specifying a grid item's size and location within the grid column by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start and inline-end edge of its grid area.
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-column
		 */
		"grid-column"(values: CssValue[][]): Command;
	}
}
