
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`color-adjust`** CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device.
		 * 
		 * **Initial value**: `economy`
		 * 
		 * |    Chrome    | Firefox |   Safari    | Edge | IE  |
		 * | :----------: | :-----: | :---------: | :--: | :-: |
		 * | **49** _-x-_ | **48**  | **6** _-x-_ |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/color-adjust
		 */
		colorAdjust(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`color-adjust`** CSS property sets what, if anything, the user agent may do to optimize the appearance of the element on the output device. By default, the browser is allowed to make any adjustments to the element's appearance it determines to be necessary and prudent given the type and capabilities of the output device.
		 * 
		 * **Initial value**: `economy`
		 * 
		 * |    Chrome    | Firefox |   Safari    | Edge | IE  |
		 * | :----------: | :-----: | :---------: | :--: | :-: |
		 * | **49** _-x-_ | **48**  | **6** _-x-_ |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/color-adjust
		 */
		colorAdjust(values: CssValue[][]): Command;
	}
}
