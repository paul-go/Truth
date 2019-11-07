
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`text-justify`** CSS property sets what type of justification should be applied to text when `text-align``: justify;` is set on an element.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * |  n/a   | **55**  |   No   | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-justify
		 */
		textJustify(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`text-justify`** CSS property sets what type of justification should be applied to text when `text-align``: justify;` is set on an element.
		 * 
		 * **Initial value**: `auto`
		 * 
		 * | Chrome | Firefox | Safari |  Edge  |   IE   |
		 * | :----: | :-----: | :----: | :----: | :----: |
		 * |  n/a   | **55**  |   No   | **12** | **11** |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/text-justify
		 */
		textJustify(values: CssValue[][]): Command;
	}
}
