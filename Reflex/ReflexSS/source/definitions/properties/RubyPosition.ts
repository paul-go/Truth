
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The `**ruby-position**` CSS property defines the position of a ruby element relatives to its base element. It can be position over the element (`over`), under it (`under`), or between the characters, on their right side (`inter-character`).
		 * 
		 * **Initial value**: `over`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * |   No   | **38**  |   No   | **12** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/ruby-position
		 */
		rubyPosition(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The `**ruby-position**` CSS property defines the position of a ruby element relatives to its base element. It can be position over the element (`over`), under it (`under`), or between the characters, on their right side (`inter-character`).
		 * 
		 * **Initial value**: `over`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  | IE  |
		 * | :----: | :-----: | :----: | :----: | :-: |
		 * |   No   | **38**  |   No   | **12** | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/ruby-position
		 */
		rubyPosition(values: CssValue[][]): Command;
	}
}
