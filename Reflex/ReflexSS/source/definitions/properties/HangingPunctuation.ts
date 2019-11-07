
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`hanging-punctuation`** CSS property specifies whether a punctuation mark should hang at the start or end of a line of text. Hanging punctuation may be placed outside the line box.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   |   No    | **10** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/hanging-punctuation
		 */
		hangingPunctuation(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`hanging-punctuation`** CSS property specifies whether a punctuation mark should hang at the start or end of a line of text. Hanging punctuation may be placed outside the line box.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   |   No    | **10** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/hanging-punctuation
		 */
		hangingPunctuation(values: CssValue[][]): Command;
	}
}
