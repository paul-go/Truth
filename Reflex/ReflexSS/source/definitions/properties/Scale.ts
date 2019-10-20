
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`scale`** CSS property allows you to specify scale transforms individually and independantly of the `transform` property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the `transform` value.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   |   n/a   |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/scale
		 */
		scale(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`scale`** CSS property allows you to specify scale transforms individually and independantly of the `transform` property. This maps better to typical user interface usage, and saves having to remember the exact order of transform functions to specify in the `transform` value.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   |   n/a   |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/scale
		 */
		scale(values: CssValue[][]): Call;
	}
}
