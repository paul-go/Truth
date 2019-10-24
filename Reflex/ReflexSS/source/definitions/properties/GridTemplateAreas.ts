
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`grid-template-areas`** CSS property specifies named grid areas.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-areas
		 */
		gridTemplateAreas(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-template-areas`** CSS property specifies named grid areas.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-areas
		 */
		gridTemplateAreas(values: CssValue[][]): Command;
		/**
		 * The **`grid-template-areas`** CSS property specifies named grid areas.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-areas
		 */
		"grid-template-areas"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`grid-template-areas`** CSS property specifies named grid areas.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox |  Safari  |  Edge  | IE  |
		 * | :----: | :-----: | :------: | :----: | :-: |
		 * | **57** | **52**  | **10.1** | **16** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/grid-template-areas
		 */
		"grid-template-areas"(values: CssValue[][]): Command;
	}
}
