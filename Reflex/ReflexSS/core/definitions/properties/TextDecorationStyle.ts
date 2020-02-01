
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-decoration-style`** CSS property sets the style of the lines specified by `text-decoration-line`. The style applies to all lines that are set with `text-decoration-line`.
		 * 
		 * **Initial value**: `solid`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **57** | **36**  | **12.1** |  No  | No  |
		 * |        |         | 8 _-x-_  |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-style
		 */
		textDecorationStyle(...values: CssValue[]): Command;
		/**
		 * The **`text-decoration-style`** CSS property sets the style of the lines specified by `text-decoration-line`. The style applies to all lines that are set with `text-decoration-line`.
		 * 
		 * **Initial value**: `solid`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | **57** | **36**  | **12.1** |  No  | No  |
		 * |        |         | 8 _-x-_  |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-style
		 */
		textDecorationStyle(...values: CssValue[][]): Command;
	}
}
