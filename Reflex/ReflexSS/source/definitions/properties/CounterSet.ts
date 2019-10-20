
declare namespace Reflex.SS
{
	export interface Namespace
	{
		/**
		 * The **`counter-set`** CSS property sets a CSS counter to a given value. It manipulates the value of existing counters, and will only create new counters if there isn't already a counter of the given name on the element.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **68**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-set
		 */
		counterSet(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`counter-set`** CSS property sets a CSS counter to a given value. It manipulates the value of existing counters, and will only create new counters if there isn't already a counter of the given name on the element.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **68**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-set
		 */
		counterSet(values: CssValue[][]): Call;
		/**
		 * The **`counter-set`** CSS property sets a CSS counter to a given value. It manipulates the value of existing counters, and will only create new counters if there isn't already a counter of the given name on the element.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **68**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-set
		 */
		"counter-set"(value: CssValue, ...values: CssValue[]): Call;
		/**
		 * The **`counter-set`** CSS property sets a CSS counter to a given value. It manipulates the value of existing counters, and will only create new counters if there isn't already a counter of the given name on the element.
		 * 
		 * **Initial value**: `none`
		 * 
		 * | Chrome | Firefox | Safari | Edge | IE  |
		 * | :----: | :-----: | :----: | :--: | :-: |
		 * |   No   | **68**  |   No   |  No  | No  |
		 * 
		 * @see https://developer.mozilla.org/docs/Web/CSS/counter-set
		 */
		"counter-set"(values: CssValue[][]): Call;
	}
}
