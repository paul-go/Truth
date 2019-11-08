
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The `**ruby-align**` CSS property defines the distribution of the different ruby elements over the base.
		 * 
		 * **Initial value**: `space-around`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **38**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/ruby-align
		 */
		rubyAlign(...values: CssValue[]): Command;
		/**
		 * The `**ruby-align**` CSS property defines the distribution of the different ruby elements over the base.
		 * 
		 * **Initial value**: `space-around`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **38**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/ruby-align
		 */
		rubyAlign(...values: CssValue[][]): Command;
	}
}
