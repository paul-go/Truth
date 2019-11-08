
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-variant-numeric`** CSS property controls the usage of alternate glyphs for numbers, fractions, and ordinal markers.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **52** | **34**  | **9.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric
		 */
		fontVariantNumeric(...values: CssValue[]): Command;
		/**
		 * The **`font-variant-numeric`** CSS property controls the usage of alternate glyphs for numbers, fractions, and ordinal markers.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * | Chrome | Firefox | Safari  | Edge | IE  |
		 * | :----: | :-----: | :-----: | :--: | :-: |
		 * | **52** | **34**  | **9.1** |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric
		 */
		fontVariantNumeric(...values: CssValue[][]): Command;
	}
}
