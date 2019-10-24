
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. You can prevent hyphenation entirely, use hyphenation in manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
		 * 
		 * **Initial value**: `manual`
		 * 
		 * |  Chrome  | Firefox |    Safari     |     Edge     |      IE      |
		 * | :------: | :-----: | :-----------: | :----------: | :----------: |
		 * |  **55**  | **43**  | **5.1** _-x-_ | **12** _-x-_ | **10** _-x-_ |
		 * | 13 _-x-_ | 6 _-x-_ |               |              |              |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/hyphens
		 */
		hyphens(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`hyphens`** CSS property specifies how words should be hyphenated when text wraps across multiple lines. You can prevent hyphenation entirely, use hyphenation in manually-specified points within the text, or let the browser automatically insert hyphens where appropriate.
		 * 
		 * **Initial value**: `manual`
		 * 
		 * |  Chrome  | Firefox |    Safari     |     Edge     |      IE      |
		 * | :------: | :-----: | :-----------: | :----------: | :----------: |
		 * |  **55**  | **43**  | **5.1** _-x-_ | **12** _-x-_ | **10** _-x-_ |
		 * | 13 _-x-_ | 6 _-x-_ |               |              |              |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/hyphens
		 */
		hyphens(values: CssValue[][]): Command;
	}
}
