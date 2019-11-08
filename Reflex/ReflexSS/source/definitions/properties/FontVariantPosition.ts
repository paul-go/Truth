
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-variant-position`** CSS property controls the use of alternate, smaller glyphs that are positioned as superscript or subscript.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **34**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-position
		 */
		fontVariantPosition(...values: CssValue[]): Command;
		/**
		 * The **`font-variant-position`** CSS property controls the use of alternate, smaller glyphs that are positioned as superscript or subscript.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **34**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-position
		 */
		fontVariantPosition(...values: CssValue[][]): Command;
	}
}
