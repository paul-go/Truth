
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-decoration-skip`** CSS property sets what parts of an element’s content any text decoration affecting the element must skip over. It controls all text decoration lines drawn by the element and also any text decoration lines drawn by its ancestors.
		 * 
		 * **Initial value**: `objects`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | 57-64  |   No    | **12.1** |  No  | No  |
		 * |        |         | 8 _-x-_  |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip
		 */
		textDecorationSkip(...values: CssValue[]): Command;
		/**
		 * The **`text-decoration-skip`** CSS property sets what parts of an element’s content any text decoration affecting the element must skip over. It controls all text decoration lines drawn by the element and also any text decoration lines drawn by its ancestors.
		 * 
		 * **Initial value**: `objects`
		 * 
		 * | Chrome | Firefox |  Safari  | Edge | IE  |
		 * | :----: | :-----: | :------: | :--: | :-: |
		 * | 57-64  |   No    | **12.1** |  No  | No  |
		 * |        |         | 8 _-x-_  |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-decoration-skip
		 */
		textDecorationSkip(...values: CssValue[][]): Command;
	}
}
