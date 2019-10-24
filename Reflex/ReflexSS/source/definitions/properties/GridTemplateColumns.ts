
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`grid-template-columns`** CSS property defines the line names and track sizing functions of the grid columns.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-columns
		 */
		gridTemplateColumns(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-template-columns`** CSS property defines the line names and track sizing functions of the grid columns.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-columns
		 */
		gridTemplateColumns(values: CssValue[][]): Command;
		/**
		 * The **`grid-template-columns`** CSS property defines the line names and track sizing functions of the grid columns.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-columns
		 */
		"grid-template-columns"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-template-columns`** CSS property defines the line names and track sizing functions of the grid columns.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-columns
		 */
		"grid-template-columns"(values: CssValue[][]): Command;
	}
}
