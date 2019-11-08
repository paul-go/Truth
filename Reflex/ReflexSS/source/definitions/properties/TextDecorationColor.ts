
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-decoration-color`** CSS property sets the color of decorations added to text by `text-decoration-line`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **57** | **36**  | **12.1** |  No  | No  |
		 * |        |         | 8 _-x-_  |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-color
		 */
		textDecorationColor(...values: CssValue[]): Command;
		/**
		 * The **`text-decoration-color`** CSS property sets the color of decorations added to text by `text-decoration-line`.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **57** | **36**  | **12.1** |  No  | No  |
		 * |        |         | 8 _-x-_  |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-color
		 */
		textDecorationColor(...values: CssValue[][]): Command;
	}
}
