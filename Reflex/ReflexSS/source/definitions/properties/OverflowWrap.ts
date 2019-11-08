
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The `**overflow-wrap**` CSS property sets whether the browser should insert line breaks within words to prevent text from overflowing its content box.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * |     Chrome      |      Firefox      |     Safari      |       Edge       |          IE           |
		 * | :-------------: | :---------------: | :-------------: | :--------------: | :-------------------: |
		 * |     **23**      |      **49**       |     **6.1**     |      **18**      | **5.5** _(word-wrap)_ |
		 * | 1 _(word-wrap)_ | 3.5 _(word-wrap)_ | 1 _(word-wrap)_ | 12 _(word-wrap)_ |                       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overflow-wrap
		 */
		overflowWrap(...values: CssValue[]): Command;
		/**
		 * The `**overflow-wrap**` CSS property sets whether the browser should insert line breaks within words to prevent text from overflowing its content box.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * |     Chrome      |      Firefox      |     Safari      |       Edge       |          IE           |
		 * | :-------------: | :---------------: | :-------------: | :--------------: | :-------------------: |
		 * |     **23**      |      **49**       |     **6.1**     |      **18**      | **5.5** _(word-wrap)_ |
		 * | 1 _(word-wrap)_ | 3.5 _(word-wrap)_ | 1 _(word-wrap)_ | 12 _(word-wrap)_ |                       |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/overflow-wrap
		 */
		overflowWrap(...values: CssValue[][]): Command;
	}
}
