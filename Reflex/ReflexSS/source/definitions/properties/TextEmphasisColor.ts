
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-emphasis-color`** CSS property sets the color of emphasis marks. This value can also be set using the `text-emphasis` shorthand.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **25** | **46**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-color
		 */
		textEmphasisColor(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-emphasis-color`** CSS property sets the color of emphasis marks. This value can also be set using the `text-emphasis` shorthand.
		 * 
		 * **Initial value**: `currentcolor`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **25** | **46**  | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-emphasis-color
		 */
		textEmphasisColor(values: CssValue[][]): Command;
	}
}
