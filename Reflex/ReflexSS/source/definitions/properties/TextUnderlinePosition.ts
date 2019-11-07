
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-underline-position`** CSS property specifies the position of the underline which is set using the `text-decoration` property's `underline` value.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **33** |   No    |   No   | **12** | **6** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-underline-position
		 */
		textUnderlinePosition(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-underline-position`** CSS property specifies the position of the underline which is set using the `text-decoration` property's `underline` value.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |  IE   |
		 * | :----: | :-----: | :----: | :----: | :---: |
		 * | **33** |   No    |   No   | **12** | **6** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-underline-position
		 */
		textUnderlinePosition(values: CssValue[][]): Command;
	}
}
