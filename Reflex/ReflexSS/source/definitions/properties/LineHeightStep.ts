
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`line-height-step`** CSS property sets the step unit for line box heights. When the property is set, line box heights are rounded up to the closest multiple of the unit.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |  n/a   |   No    |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/line-height-step
		 */
		lineHeightStep(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`line-height-step`** CSS property sets the step unit for line box heights. When the property is set, line box heights are rounded up to the closest multiple of the unit.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |  n/a   |   No    |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/line-height-step
		 */
		lineHeightStep(values: CssValue[][]): Command;
		/**
		 * The **`line-height-step`** CSS property sets the step unit for line box heights. When the property is set, line box heights are rounded up to the closest multiple of the unit.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |  n/a   |   No    |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/line-height-step
		 */
		"line-height-step"(value: CssValue, ...values: CssValue[]): Command;
		/**
		 * The **`line-height-step`** CSS property sets the step unit for line box heights. When the property is set, line box heights are rounded up to the closest multiple of the unit.
		 * 
		 * **Initial value**: `0`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |  n/a   |   No    |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/line-height-step
		 */
		"line-height-step"(values: CssValue[][]): Command;
	}
}
