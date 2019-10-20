
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`offset`** CSS property is a shorthand property for animating an element along a defined path.
		 * 
		 * |    Chrome     | Firefox | Safari | Edge | IE  |
		 * | :-----------: | :-----: | :----: | :--: | :-: |
		 * |    **55**     |   No    |   No   |  No  | No  |
		 * | 46 _(motion)_ |         |        |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/offset
		 */
		offset(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`offset`** CSS property is a shorthand property for animating an element along a defined path.
		 * 
		 * |    Chrome     | Firefox | Safari | Edge | IE  |
		 * | :-----------: | :-----: | :----: | :--: | :-: |
		 * |    **55**     |   No    |   No   |  No  | No  |
		 * | 46 _(motion)_ |         |        |      |     |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/offset
		 */
		offset(values: CssValue[][]): Call;
	}
}
