
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The `**user-select**` CSS property controls whether the user can select text. This doesn't have any effect on content loaded as chrome, except in textboxes.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  | Firefox |   Safari    |     Edge     |      IE      |
		 * | :-----: | :-----: | :---------: | :----------: | :----------: |
		 * | **54**  | **69**  | **3** _-x-_ | **12** _-x-_ | **10** _-x-_ |
		 * | 1 _-x-_ | 1 _-x-_ |             |              |              |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/user-select
		 */
		userSelect(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The `**user-select**` CSS property controls whether the user can select text. This doesn't have any effect on content loaded as chrome, except in textboxes.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome  | Firefox |   Safari    |     Edge     |      IE      |
		 * | :-----: | :-----: | :---------: | :----------: | :----------: |
		 * | **54**  | **69**  | **3** _-x-_ | **12** _-x-_ | **10** _-x-_ |
		 * | 1 _-x-_ | 1 _-x-_ |             |              |              |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/user-select
		 */
		userSelect(values: CssValue[][]): Command;
	}
}
