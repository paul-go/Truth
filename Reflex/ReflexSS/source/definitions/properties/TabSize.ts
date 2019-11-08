
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`tab-size`** CSS property is used to customize the width of a tab (`U+0009`) character.
		 * 
		 * **Initial value**: `8`
		 * 
		 * | Chrome |   Firefox   | Safari  | Edge | IE  |
		 * | :----: | :---------: | :-----: | :--: | :-: |
		 * | **21** | **4** _-x-_ | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/tab-size
		 */
		tabSize(...values: CssValue[]): Command;
		/**
		 * The **`tab-size`** CSS property is used to customize the width of a tab (`U+0009`) character.
		 * 
		 * **Initial value**: `8`
		 * 
		 * | Chrome |   Firefox   | Safari  | Edge | IE  |
		 * | :----: | :---------: | :-----: | :--: | :-: |
		 * | **21** | **4** _-x-_ | **6.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/tab-size
		 */
		tabSize(...values: CssValue[][]): Command;
	}
}
