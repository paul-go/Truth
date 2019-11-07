
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`grid-template-rows`** CSS property defines the line names and track sizing functions of the grid rows.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-rows
		 */
		gridTemplateRows(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-template-rows`** CSS property defines the line names and track sizing functions of the grid rows.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-rows
		 */
		gridTemplateRows(values: CssValue[][]): Command;
	}
}
