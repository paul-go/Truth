
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-emphasis-position`** CSS property sets where emphasis marks are drawn. Like ruby text, if there isn't enough room for emphasis marks, the line height is increased.
		 * 
		 * **Initial value**: `over right`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **25** | **46**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-position
		 */
		textEmphasisPosition(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-emphasis-position`** CSS property sets where emphasis marks are drawn. Like ruby text, if there isn't enough room for emphasis marks, the line height is increased.
		 * 
		 * **Initial value**: `over right`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **25** | **46**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-position
		 */
		textEmphasisPosition(values: CssValue[][]): Command;
	}
}
