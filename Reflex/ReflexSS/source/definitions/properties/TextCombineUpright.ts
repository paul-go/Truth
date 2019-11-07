
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-combine-upright`** CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.
		 * 
		 * **Initial value**: `none`
		 * 
		 * |           Chrome           | Firefox |              Safari              |                  Edge                  |                   IE                   |
		 * | :------------------------: | :-----: | :------------------------------: | :------------------------------------: | :------------------------------------: |
		 * |           **48**           | **48**  | **5.1** _(-webkit-text-combine)_ | **12** _(-ms-text-combine-horizontal)_ | **11** _(-ms-text-combine-horizontal)_ |
		 * | 9 _(-webkit-text-combine)_ |         |                                  |                                        |                                        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-combine-upright
		 */
		textCombineUpright(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-combine-upright`** CSS property sets the combination of characters into the space of a single character. If the combined text is wider than 1em, the user agent must fit the contents within 1em. The resulting composition is treated as a single upright glyph for layout and decoration. This property only has an effect in vertical writing modes.
		 * 
		 * **Initial value**: `none`
		 * 
		 * |           Chrome           | Firefox |              Safari              |                  Edge                  |                   IE                   |
		 * | :------------------------: | :-----: | :------------------------------: | :------------------------------------: | :------------------------------------: |
		 * |           **48**           | **48**  | **5.1** _(-webkit-text-combine)_ | **12** _(-ms-text-combine-horizontal)_ | **11** _(-ms-text-combine-horizontal)_ |
		 * | 9 _(-webkit-text-combine)_ |         |                                  |                                        |                                        |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-combine-upright
		 */
		textCombineUpright(values: CssValue[][]): Command;
	}
}
