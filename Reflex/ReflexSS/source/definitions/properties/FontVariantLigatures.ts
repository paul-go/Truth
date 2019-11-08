
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`font-variant-ligatures`** CSS property controls which ligatures and contextual forms are used in textual content of the elements it applies to. This leads to more harmonized forms in the resulting text.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * |  Chrome  | Firefox | Safari  | Edge | IE  |
		 * | :------: | :-----: | :-----: | :--: | :-: |
		 * |  **34**  | **34**  | **9.1** |  No  | No  |
		 * | 31 _-x-_ |         | 7 _-x-_ |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-ligatures
		 */
		fontVariantLigatures(...values: CssValue[]): Command;
		/**
		 * The **`font-variant-ligatures`** CSS property controls which ligatures and contextual forms are used in textual content of the elements it applies to. This leads to more harmonized forms in the resulting text.
		 * 
		 * **Initial value**: `normal`
		 * 
		 * |  Chrome  | Firefox | Safari  | Edge | IE  |
		 * | :------: | :-----: | :-----: | :--: | :-: |
		 * |  **34**  | **34**  | **9.1** |  No  | No  |
		 * | 31 _-x-_ |         | 7 _-x-_ |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/font-variant-ligatures
		 */
		fontVariantLigatures(...values: CssValue[][]): Command;
	}
}
