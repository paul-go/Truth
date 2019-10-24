
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`grid-auto-flow`** CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid.
		 * 
		 * **Initial value**: `row`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-flow
		 */
		gridAutoFlow(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-auto-flow`** CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid.
		 * 
		 * **Initial value**: `row`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-flow
		 */
		gridAutoFlow(values: CssValue[][]): Command;
		/**
		 * The **`grid-auto-flow`** CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid.
		 * 
		 * **Initial value**: `row`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-flow
		 */
		"grid-auto-flow"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-auto-flow`** CSS property controls how the auto-placement algorithm works, specifying exactly how auto-placed items get flowed into the grid.
		 * 
		 * **Initial value**: `row`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-auto-flow
		 */
		"grid-auto-flow"(values: CssValue[][]): Command;
	}
}
